/**
 * Supabase Client & Realtime Sync Service for Astro Tiwari
 * 
 * Provides cloud persistence for consultations, submissions, and user accounts
 * with seamless fallback to local JSON storage for 100% offline/local resilience.
 */

const https = require('https');
const url = require('url');

class SupabaseClient {
  constructor() {
    this.projectUrl = process.env.SUPABASE_URL || 'https://vrgraptxhfxlitmywyde.supabase.co';
    this.anonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_X1xxwM_qSYA1o4oPYvxp0A_iKoRVwQA';
    this.projectRef = process.env.SUPABASE_PROJECT_REF || 'vrgraptxhfxlitmywyde';
    this.lastSync = null;
    this.isOnline = false;
  }

  isConfigured() {
    return Boolean(this.projectUrl && this.anonKey);
  }

  /**
   * Internal HTTPS request helper for Supabase PostgREST API
   */
  async request(endpoint, options = {}) {
    if (!this.isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }

    return new Promise((resolve) => {
      try {
        const parsedUrl = new URL(`${this.projectUrl}/rest/v1${endpoint}`);
        const reqOptions = {
          method: options.method || 'GET',
          hostname: parsedUrl.hostname,
          port: 443,
          path: `${parsedUrl.pathname}${parsedUrl.search}`,
          headers: {
            'apikey': this.anonKey,
            'Authorization': `Bearer ${this.anonKey}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
          },
          timeout: options.timeout || 8000
        };

        const req = https.request(reqOptions, (res) => {
          let rawData = '';
          res.on('data', chunk => { rawData += chunk; });
          res.on('end', () => {
            let body = null;
            try {
              if (rawData) body = JSON.parse(rawData);
            } catch {
              body = rawData;
            }

            const ok = res.statusCode >= 200 && res.statusCode < 300;
            if (ok) {
              this.isOnline = true;
              this.lastSync = new Date().toISOString();
            }
            resolve({ ok, statusCode: res.statusCode, body });
          });
        });

        req.on('error', (err) => {
          this.isOnline = false;
          resolve({ ok: false, error: err.message });
        });

        req.on('timeout', () => {
          req.destroy();
          this.isOnline = false;
          resolve({ ok: false, error: 'Request timeout' });
        });

        if (options.body) {
          req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
        req.end();
      } catch (err) {
        this.isOnline = false;
        resolve({ ok: false, error: err.message });
      }
    });
  }

  /**
   * Check connection health to Supabase
   */
  async healthCheck() {
    try {
      const res = await this.request('/submissions?select=id&limit=1');
      return {
        connected: res.ok,
        projectRef: this.projectRef,
        url: this.projectUrl,
        statusCode: res.statusCode || null,
        error: res.error || null,
        lastSync: this.lastSync
      };
    } catch (e) {
      return {
        connected: false,
        projectRef: this.projectRef,
        url: this.projectUrl,
        error: e.message
      };
    }
  }

  /**
   * Convert local camelCase submission to Supabase snake_case
   */
  toDbSubmission(sub) {
    return {
      id: String(sub.id || ''),
      order_id: sub.orderId || null,
      transaction_id: sub.transactionId || null,
      created_at: sub.createdAt ? new Date(sub.createdAt).toISOString() : new Date().toISOString(),
      name: sub.name || 'ग्राहक',
      phone: sub.phone || null,
      email: sub.email || null,
      gender: sub.gender || null,
      dob_bs: sub.dobBs || null,
      dob_ad: sub.dobAd || null,
      birth_time: sub.birthTime || null,
      birth_period: sub.birthPeriod || null,
      birth_place: sub.birthPlace || null,
      package: sub.package || null,
      amount: typeof sub.amount === 'number' ? sub.amount : parseFloat(sub.amount) || 0,
      message: sub.message || null,
      rectification: sub.rectification || null,
      payment_screenshot_url: sub.paymentScreenshotUrl || null,
      kundali_photo_url: sub.kundaliPhotoUrl || null,
      chart_svg_url: sub.chartSvgUrl || null,
      circle_svg_url: sub.circleSvgUrl || null,
      kundali_data: sub.kundaliData || {},
      status: sub.status || 'pending',
      notes: sub.notes || null,
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Convert Supabase snake_case record to local camelCase
   */
  fromDbSubmission(row) {
    return {
      id: row.id,
      orderId: row.order_id || row.id,
      transactionId: row.transaction_id || '',
      createdAt: row.created_at,
      name: row.name,
      phone: row.phone || '',
      email: row.email || '',
      gender: row.gender || '',
      dobBs: row.dob_bs || '',
      dobAd: row.dob_ad || '',
      birthTime: row.birth_time || '',
      birthPeriod: row.birth_period || '',
      birthPlace: row.birth_place || '',
      package: row.package || '',
      amount: row.amount || 0,
      message: row.message || '',
      rectification: row.rectification || '',
      paymentScreenshotUrl: row.payment_screenshot_url || '',
      kundaliPhotoUrl: row.kundali_photo_url || '',
      chartSvgUrl: row.chart_svg_url || '',
      circleSvgUrl: row.circle_svg_url || '',
      kundaliData: row.kundali_data || {},
      status: row.status || 'pending',
      notes: row.notes || ''
    };
  }

  /**
   * Fetch all submissions from Supabase
   */
  async fetchSubmissions() {
    const res = await this.request('/submissions?select=*&order=created_at.desc');
    if (res.ok && Array.isArray(res.body)) {
      return res.body.map(r => this.fromDbSubmission(r));
    }
    return null;
  }

  /**
   * Upsert a single submission to Supabase
   */
  async saveSubmission(sub) {
    const record = this.toDbSubmission(sub);
    const res = await this.request('/submissions', {
      method: 'POST',
      headers: {
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: record
    });
    return res.ok;
  }

  /**
   * Bulk upsert multiple submissions
   */
  async saveSubmissionsBulk(submissions) {
    if (!Array.isArray(submissions) || submissions.length === 0) return true;
    const records = submissions.map(s => this.toDbSubmission(s));
    const res = await this.request('/submissions', {
      method: 'POST',
      headers: {
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: records
    });
    return res.ok;
  }

  /**
   * Update submission status and notes
   */
  async updateSubmissionStatus(id, status, notes) {
    const patch = {
      status,
      updated_at: new Date().toISOString()
    };
    if (notes !== undefined) patch.notes = notes;

    const res = await this.request(`/submissions?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Prefer': 'return=representation'
      },
      body: patch
    });
    return res.ok;
  }

  /**
   * Delete submission by ID
   */
  async deleteSubmission(id) {
    const res = await this.request(`/submissions?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  }

  /**
   * Fetch all users
   */
  async fetchUsers() {
    const res = await this.request('/users?select=*&order=created_at.desc');
    if (res.ok && Array.isArray(res.body)) {
      return res.body.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        passwordHash: u.password_hash,
        role: u.role,
        profileData: u.profile_data || {},
        createdAt: u.created_at
      }));
    }
    return null;
  }

  /**
   * Save / Upsert user
   */
  async saveUser(user) {
    const record = {
      id: String(user.id || ''),
      name: user.name || 'User',
      email: user.email || null,
      phone: user.phone || null,
      password_hash: user.passwordHash || user.password_hash || null,
      role: user.role || 'user',
      profile_data: user.profileData || user.profile_data || {},
      created_at: user.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const res = await this.request('/users', {
      method: 'POST',
      headers: {
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: record
    });
    return res.ok;
  }
}

module.exports = new SupabaseClient();
