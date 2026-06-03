/* ============================================
   OneKlyx Order Form Wizard — Multi-step Form
   Step 1: Project Info
   Step 2: Project Details
   Step 3: Confirmation & Submit
   ============================================ */

class OrderFormWizard {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 3;
    this.formData = {};
    this.selectedChips = [];
    
    this.init();
  }

  init() {
    this.bindStepNavigation();
    this.bindChips();
    this.bindFileUpload();
    this.bindFormInputs();
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

    // Hide current step
    document.querySelector(`.form-step[data-step="${this.currentStep}"]`)?.classList.remove('active');
    
    // Show new step
    document.querySelector(`.form-step[data-step="${step}"]`)?.classList.add('active');

    // Update progress indicators
    this.updateProgress(step);

    // If going to step 3, build summary
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

    // Clear previous errors
    stepEl.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
      input.classList.remove('error');
    });

    if (step === 1) {
      // Full Name
      const name = stepEl.querySelector('#fullName');
      if (name && !name.value.trim()) {
        this.showError(name, 'Nama lengkap wajib diisi');
        isValid = false;
      }

      // Email
      const email = stepEl.querySelector('#email');
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) {
          this.showError(email, 'Email wajib diisi');
          isValid = false;
        } else if (!emailRegex.test(email.value)) {
          this.showError(email, 'Format email tidak valid');
          isValid = false;
        }
      }

      // WhatsApp
      const whatsapp = stepEl.querySelector('#whatsapp');
      if (whatsapp) {
        const phoneRegex = /^(\+62|62|08)[0-9]{8,13}$/;
        if (!whatsapp.value.trim()) {
          this.showError(whatsapp, 'Nomor WhatsApp wajib diisi');
          isValid = false;
        } else if (!phoneRegex.test(whatsapp.value.replace(/\s|-/g, ''))) {
          this.showError(whatsapp, 'Format nomor tidak valid (gunakan +62 atau 08xxx)');
          isValid = false;
        }
      }

      // Project Type
      const projectType = stepEl.querySelector('#projectType');
      if (projectType && !projectType.value) {
        this.showError(projectType, 'Pilih jenis proyek');
        isValid = false;
      }

      // Budget (radio)
      const budgetChecked = stepEl.querySelector('input[name="budget"]:checked');
      if (!budgetChecked) {
        // Highlight the budget area
        const budgetGroup = stepEl.querySelector('.radio-group');
        if (budgetGroup) {
          budgetGroup.style.outline = '1px solid #ff4466';
          budgetGroup.style.borderRadius = '8px';
          setTimeout(() => {
            budgetGroup.style.outline = 'none';
          }, 3000);
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

      // Description
      const desc = stepEl.querySelector('#projectDesc');
      if (desc) {
        if (!desc.value.trim()) {
          this.showError(desc, 'Deskripsi proyek wajib diisi');
          isValid = false;
        } else if (desc.value.trim().length < 50) {
          this.showError(desc, `Minimum 50 karakter (saat ini ${desc.value.trim().length})`);
          isValid = false;
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

  // ---- Bind Input Events ----
  bindFormInputs() {
    // Real-time validation on blur
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
      input.addEventListener('focus', () => {
        input.classList.remove('error');
        const errorEl = input.parentElement.querySelector('.error-message');
        if (errorEl) errorEl.style.display = 'none';
      });
    });

    // Character counter for textarea
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

    if (uploadArea && fileInput) {
      uploadArea.addEventListener('click', () => fileInput.click());

      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--color-accent-blue)';
      });

      uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--color-border)';
      });

      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--color-border)';
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
  }

  handleFile(file, fileNameEl) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    
    if (file.size > maxSize) {
      alert('File terlalu besar. Maksimum 10MB.');
      return;
    }

    if (!allowed.includes(file.type)) {
      alert('Format file tidak didukung. Gunakan PDF, PNG, atau JPG.');
      return;
    }

    if (fileNameEl) {
      fileNameEl.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
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
      { label: 'Tech Stack', value: this.selectedChips.length ? this.selectedChips.join(', ') : 'No Preference' },
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
      email: document.querySelector('#email')?.value || '',
      whatsapp: document.querySelector('#whatsapp')?.value || '',
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

    // Show loading
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

      // If there's a file, read it as base64 and include in payload
      if (this.formData.file) {
        const base64 = await this.readFileAsBase64(this.formData.file);
        payload.fileData = base64;
        payload.fileName = this.formData.file.name;
        payload.fileType = this.formData.file.type;
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (loadingState) loadingState.classList.remove('show');
        if (successState) successState.classList.add('show');

        const waBtn = successState.querySelector('a[href^="https://wa.me"]');
        if (waBtn && result.whatsappUrl) waBtn.href = result.whatsappUrl;

        console.log('Order submitted successfully:', result);
      } else {
        throw new Error(result.message || 'Terjadi kesalahan saat mengirim pesanan.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      // Revert loading state back to form fields
      if (loadingState) loadingState.classList.remove('show');
      if (formSteps) formSteps.style.display = 'block';
      if (progressBar) progressBar.style.display = 'flex';

      alert(error.message || 'Gagal mengirim pesanan. Silakan periksa koneksi server Anda.');
    }
  }

  readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result || '';
        // result is data:<mime>;base64,xxxx
        const parts = result.split(',');
        resolve(parts[1] || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new OrderFormWizard();
});

