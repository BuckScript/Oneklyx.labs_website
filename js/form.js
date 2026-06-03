/* ============================================
   OneKlyx Order Form Wizard — Multi-step Form
   PRODUCTION VERSION with Full Validation & Error Handling
   ============================================ */

class OrderFormWizard {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 3;
    this.formData = {};
    this.selectedChips = [];
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.maxPayloadSize = 4 * 1024 * 1024; // 4MB (Vercel limit)\n    this.init();
  }

  init() {
    this.bindStepNavigation();
    this.bindChips();
    this.bindFileUpload();
    this.bindFormInputs();
  }

  // ---- VALIDATORS ----
  validateEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email) && email.length <= 255;
  }

  validateWhatsApp(whatsapp) {
    const regex = /^(\+62|62|08)[0-9]{8,13}$/;
    const cleaned = whatsapp.replace(/[\s-]/g, '');
    return regex.test(cleaned);
  }

  // ---- Step Navigation ----
  bindStepNavigation() {
    document.querySelectorAll('[data-form-next]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.validateStep(this.currentStep)) {
          this.goToStep(this.currentStep + 1);
        }
      });
    });

    document.querySelectorAll('[data-form-prev]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.goToStep(this.currentStep - 1);
      });
    });

    document.querySelector('[data-form-submit]')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.validateStep(3)) {
        this.submitForm();
      }
    });
  }

  goToStep(step) {
    if (step < 1 || step > this.totalSteps) return;

    document.querySelector(`.form-step[data-step="${this.currentStep}"]`)?.classList.remove('active');
    document.querySelector(`.form-step[data-step="${step}"]`)?.classList.add('active');

    this.updateProgress(step);

    if (step === 3) {
      this.buildSummary();
    }

    this.currentStep = step;
  }

  updateProgress(step) {
    document.querySelectorAll('.progress-step').forEach((el, i) => {
      const stepNum = i + 1;
      el.classList.remove('active', 'completed');

      if (stepNum === step) {
        el.classList.add('active');
      } else if (stepNum < step) {
        el.classList.add('completed');
      }
    });

    document.querySelectorAll('.progress-line').forEach((line, i) => {
      if (i + 1 < step) {
        line.classList.add('active');
      } else {
        line.classList.remove('active');
      }
    });
  }

  // ---- Validation ----
  validateStep(step) {
    let isValid = true;
    const stepEl = document.querySelector(`.form-step[data-step="${step}"]`);
    if (!stepEl) return true;

    stepEl.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
      input.classList.remove('error');
    });

    if (step === 1) {
      // Full Name
      const name = stepEl.querySelector('#fullName');
      if (name) {
        if (!name.value.trim()) {
          this.showError(name, 'Nama lengkap wajib diisi');
          isValid = false;
        } else if (name.value.trim().length > 255) {
          this.showError(name, 'Nama terlalu panjang (maksimal 255 karakter)');
          isValid = false;
        }
      }

      // Email (strict validation)
      const email = stepEl.querySelector('#email');
      if (email) {
        const emailValue = email.value.trim().toLowerCase();
        if (!emailValue) {
          this.showError(email, 'Email wajib diisi');
          isValid = false;
        } else if (!this.validateEmail(emailValue)) {
          this.showError(email, 'Format email tidak valid');\n          isValid = false;
        }
      }

      // WhatsApp (Indonesia)
      const whatsapp = stepEl.querySelector('#whatsapp');
      if (whatsapp) {
        const waValue = whatsapp.value.trim().replace(/[\s-]/g, '');
        if (!waValue) {
          this.showError(whatsapp, 'Nomor WhatsApp wajib diisi');
          isValid = false;
        } else if (!this.validateWhatsApp(whatsapp.value.trim())) {
          this.showError(whatsapp, 'Format tidak valid. Gunakan +62, 62, atau 08 diikuti 8-13 angka');
          isValid = false;
        }
      }

      // Project Type
      const projectType = stepEl.querySelector('#projectType');
      if (projectType && !projectType.value) {
        this.showError(projectType, 'Pilih jenis proyek');
        isValid = false;
      }

      // Budget
      const budgetChecked = stepEl.querySelector('input[name="budget"]:checked');
      if (!budgetChecked) {
        const budgetGroup = stepEl.querySelector('.radio-group');
        if (budgetGroup) {
          budgetGroup.style.outline = '2px solid #ff4466';
          budgetGroup.style.borderRadius = '8px';
          setTimeout(() => (budgetGroup.style.outline = 'none'), 3000);
        }
        isValid = false;
      }
    }

    if (step === 2) {
      // Project Title
      const title = stepEl.querySelector('#projectTitle');
      if (title && !title.value.trim()) {
        this.showError(title, 'Judul proyek wajib diisi');
        isValid = false;
      }

      // Description (min 50 chars)
      const desc = stepEl.querySelector('#projectDesc');
      if (desc) {
        if (!desc.value.trim()) {
          this.showError(desc, 'Deskripsi proyek wajib diisi');
          isValid = false;
        } else if (desc.value.trim().length < 50) {
          this.showError(desc, `Minimum 50 karakter (saat ini ${desc.value.trim().length})`);\n          isValid = false;
        }
      }
    }

    if (step === 3) {
      // Terms checkbox
      const terms = stepEl.querySelector('#termsCheck');
      if (terms && !terms.checked) {
        terms.style.borderColor = '#ff4466';
        isValid = false;
      }
    }

    return isValid;
  }

  showError(input, message) {
    input.classList.add('error');
    const errorEl = input.parentElement.querySelector('.error-message');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  // ---- Input Events ----
  bindFormInputs() {
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
      input.addEventListener('focus', () => {
        input.classList.remove('error');
        const errorEl = input.parentElement.querySelector('.error-message');
        if (errorEl) errorEl.style.display = 'none';
      });
    });

    const desc = document.querySelector('#projectDesc');
    const counter = document.querySelector('#charCount');
    if (desc && counter) {
      desc.addEventListener('input', () => {
        const len = desc.value.trim().length;
        counter.textContent = `${len}/50 karakter minimum`;
        counter.style.color = len >= 50 ? '#00cc88' : 'var(--color-text-muted)';
      });
    }
  }

  // ---- Tech Stack Chips ----
  bindChips() {
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('selected');
        const value = chip.dataset.value;
        if (chip.classList.contains('selected')) {
          if (!this.selectedChips.includes(value)) {
            this.selectedChips.push(value);
          }
        } else {
          this.selectedChips = this.selectedChips.filter(c => c !== value);
        }
      });
    });
  }

  // ---- File Upload ----
  bindFileUpload() {
    const uploadArea = document.querySelector('.file-upload-area');
    const fileInput = document.querySelector('#fileUpload');
    const fileName = document.querySelector('#fileName');

    if (!uploadArea || !fileInput) return;

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--color-accent-blue)';
      uploadArea.style.backgroundColor = 'rgba(0, 102, 255, 0.05)';
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = 'var(--color-border)';
      uploadArea.style.backgroundColor = 'transparent';
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--color-border)';
      uploadArea.style.backgroundColor = 'transparent';
      if (e.dataTransfer.files.length) {
        this.handleFile(e.dataTransfer.files[0], fileName);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) {
        this.handleFile(fileInput.files[0], fileName);
      }
    });
  }

  handleFile(file, fileNameEl) {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];

    if (!file) {
      alert('File tidak valid. Silakan coba lagi.');
      return;
    }

    if (file.size > this.maxFileSize) {
      const currentMB = (file.size / (1024 * 1024)).toFixed(1);
      const maxMB = (this.maxFileSize / (1024 * 1024)).toFixed(0);
      alert(`File terlalu besar. Maksimum ${maxMB}MB (saat ini ${currentMB}MB).`);
      return;
    }

    if (!allowed.includes(file.type)) {
      alert('Format file tidak didukung. Hanya PDF, PNG, dan JPG yang diizinkan.');
      return;
    }

    if (fileNameEl) {
      const sizeKB = (file.size / 1024).toFixed(0);
      fileNameEl.textContent = `📄 ${file.name} (${sizeKB} KB)`;\n      fileNameEl.style.color = '#00cc88';
    }
    this.formData.file = file;
  }

  // ---- Build Summary ----
  buildSummary() {
    const summaryEl = document.querySelector('#orderSummary');
    if (!summaryEl) return;

    const data = this.collectFormData();

    const rows = [
      { label: 'Nama', value: data.fullName },
      { label: 'Email', value: data.email },
      { label: 'WhatsApp', value: data.whatsapp },
      { label: 'Perusahaan', value: data.company || '-' },
      { label: 'Jenis Proyek', value: data.projectType },
      { label: 'Budget', value: data.budget },
      { label: 'Judul Proyek', value: data.projectTitle },
      { label: 'Deskripsi', value: data.projectDesc ? (data.projectDesc.substring(0, 100) + (data.projectDesc.length > 100 ? '...' : '')) : '-' },
      { label: 'Deadline', value: data.deadline || '-' },
      { label: 'Tech Stack', value: this.selectedChips.length ? this.selectedChips.join(', ') : 'Tidak ada preferensi' },
      { label: 'File', value: this.formData.file ? this.formData.file.name : 'Tidak ada' },
    ];

    summaryEl.innerHTML = rows.map(r => `
      <div class="summary-row">
        <span class="label">${r.label}</span>
        <span class="value">${r.value}</span>
      </div>
    `).join('');
  }

  collectFormData() {
    return {
      fullName: document.querySelector('#fullName')?.value || '',
      email: document.querySelector('#email')?.value.trim().toLowerCase() || '',
      whatsapp: document.querySelector('#whatsapp')?.value.trim() || '',
      company: document.querySelector('#company')?.value || '',
      projectType: document.querySelector('#projectType')?.options[document.querySelector('#projectType')?.selectedIndex]?.text || '',
      budget: document.querySelector('input[name="budget"]:checked')?.parentElement.querySelector('label')?.textContent || '',
      projectTitle: document.querySelector('#projectTitle')?.value || '',
      projectDesc: document.querySelector('#projectDesc')?.value || '',
      deadline: document.querySelector('#deadline')?.value || '',
      referenceLinks: [
        document.querySelector('#ref1')?.value,
        document.querySelector('#ref2')?.value,
        document.querySelector('#ref3')?.value,
      ].filter(Boolean),
      techStack: this.selectedChips,
    };
  }

  // ---- Submit Form ----
  async submitForm() {
    const formSteps = document.querySelector('#formSteps');
    const loadingState = document.querySelector('#loadingState');
    const successState = document.querySelector('#formSuccess');
    const progressBar = document.querySelector('.form-progress');

    if (formSteps) formSteps.style.display = 'none';
    if (progressBar) progressBar.style.display = 'none';
    if (loadingState) loadingState.classList.add('show');

    try {
      const data = this.collectFormData();

      const payload = {
        fullName: data.fullName,
        email: data.email,
        whatsapp: data.whatsapp,
        company: data.company,
        projectType: data.projectType,
        budget: data.budget,
        projectTitle: data.projectTitle,
        projectDesc: data.projectDesc,
        deadline: data.deadline,
        referenceLinks: data.referenceLinks,
        techStack: data.techStack
      };

      // Process file if present
      if (this.formData.file) {
        try {
          const base64 = await this.readFileAsBase64(this.formData.file);
          payload.fileData = base64;
          payload.fileName = this.formData.file.name;
          payload.fileType = this.formData.file.type;

          // Check total payload size
          const payloadStr = JSON.stringify(payload);
          const payloadSizeMB = new Blob([payloadStr]).size / (1024 * 1024);
          if (payloadSizeMB > (this.maxPayloadSize / (1024 * 1024))) {
            throw new Error(`Payload terlalu besar (${payloadSizeMB.toFixed(1)}MB). Gunakan file lebih kecil.`);
          }
        } catch (err) {
          throw new Error(err.message || 'Gagal memproses file.');\n        }
      }

      // Send request with timeout
      let response;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
      } catch (fetchErr) {
        if (fetchErr.name === 'AbortError') {
          throw new Error('Request timeout. Silakan cek koneksi dan coba lagi.');\n        }\n        throw new Error('Gagal terhubung ke server. Periksa koneksi internet Anda.');\n      }\n\n      // Parse response\n      let result;\n      try {\n        result = await response.json();\n      } catch (e) {\n        throw new Error('Respons server tidak valid. Hubungi support jika masalah berlanjut.');\n      }\n\n      if (response.ok && result.success) {\n        if (loadingState) loadingState.classList.remove('show');\n        if (successState) successState.classList.add('show');\n\n        const waBtn = successState.querySelector('a[href^=\"https://wa.me\"]');\n        if (waBtn && result.whatsappUrl) waBtn.href = result.whatsappUrl;\n\n        console.log('✓ Order submitted:', result.referenceNumber);\n      } else {\n        const msg = result.message || 'Terjadi kesalahan. Silakan coba lagi atau hubungi support.';\n        throw new Error(msg);\n      }\n    } catch (error) {\n      console.error('❌ Submission error:', error.message);\n      if (loadingState) loadingState.classList.remove('show');\n      if (formSteps) formSteps.style.display = 'block';\n      if (progressBar) progressBar.style.display = 'flex';\n\n      alert(error.message || 'Gagal mengirim pesanan. Silakan periksa dan coba lagi.');\n    }\n  }\n\n  readFileAsBase64(file) {\n    return new Promise((resolve, reject) => {\n      const reader = new FileReader();\n\n      reader.onload = () => {\n        try {\n          const result = reader.result || '';\n          const parts = result.split(',');\n          if (parts.length < 2) throw new Error('Invalid file format');\n          resolve(parts[1]);\n        } catch (e) {\n          reject(new Error('Gagal membaca file: ' + e.message));\n        }\n      };\n\n      reader.onerror = () => reject(new Error('Error membaca file'));\n      reader.onabort = () => reject(new Error('Pembacaan file dibatalkan'));\n\n      // Timeout for file reading (10 seconds)\n      const timeoutId = setTimeout(() => {\n        reader.abort();\n        reject(new Error('Timeout membaca file'));\n      }, 10000);\n\n      reader.onload = () => {\n        clearTimeout(timeoutId);\n        try {\n          const result = reader.result || '';\n          const parts = result.split(',');\n          if (parts.length < 2) throw new Error('Invalid file format');\n          resolve(parts[1]);\n        } catch (e) {\n          reject(new Error('Gagal membaca file: ' + e.message));\n        }\n      };\n\n      reader.readAsDataURL(file);\n    });\n  }\n}\n\n// Initialize\ndocument.addEventListener('DOMContentLoaded', () => {\n  new OrderFormWizard();\n});\n