// Medieval Character Sheet - Form Handling
// Location: /home/hullivan/Hugues.W.B.dePingon/js/forms.js

// Contact Method Switcher - Initialize function
export function initializeContactMethods() {
    // Contact buttons use onclick in HTML, so just ensure everything is visible
    // Make sure form section is visible by default
    const formSection = document.getElementById('contact-form-section');
    if (formSection) {
        formSection.style.display = 'block';
    }
}

// Contact Form Navigation
let currentQuestion = 1;
const totalQuestions = 5;

export function switchContactMethod(method) {
    // Update button states
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.method === method) {
            btn.classList.add('active');
        }
    });

    // Hide all sections
    document.querySelectorAll('.contact-method-content').forEach(section => {
        section.style.display = 'none';
    });

    // Show selected section
    document.getElementById(`contact-${method}-section`).style.display = 'block';
}

export function nextQuestion() {
    // Only handle mobile questions for navigation
    const currentQ = document.querySelector(`.mobile-question[data-question="${currentQuestion}"]`);
    if (!currentQ) return;

    const inputs = currentQ.querySelectorAll('input[required], textarea[required]');

    // Validate current question
    let isValid = true;
    inputs.forEach(input => {
        if (input.type === 'radio') {
            const radioGroup = currentQ.querySelectorAll(`input[name="${input.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            if (!isChecked) isValid = false;
        } else if (!input.value.trim()) {
            isValid = false;
        }
    });

    if (!isValid) {
        // Show validation feedback
        currentQ.style.animation = 'shake 0.3s';
        setTimeout(() => currentQ.style.animation = '', 300);
        return;
    }

    // Hide current question
    currentQ.classList.remove('active');
    currentQ.style.display = 'none';

    // Show next question
    currentQuestion++;
    const nextQ = document.querySelector(`.mobile-question[data-question="${currentQuestion}"]`);
    if (nextQ) {
        nextQ.classList.add('active');
        nextQ.style.display = 'block';
    }

    // Update progress dots
    updateProgressDots();

    // Update navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) nextBtn.style.display = currentQuestion === totalQuestions ? 'none' : 'block';

    // Handle mobile submit button
    const mobileSubmitBtn = document.getElementById('mobile-submit-btn');
    if (mobileSubmitBtn) {
        mobileSubmitBtn.style.display = currentQuestion === totalQuestions ? 'block' : 'none';
    }
}

export function previousQuestion() {
    // Only handle mobile questions for navigation
    const currentQ = document.querySelector(`.mobile-question[data-question="${currentQuestion}"]`);
    if (!currentQ) return;

    // Hide current question
    currentQ.classList.remove('active');
    currentQ.style.display = 'none';

    // Show previous question
    currentQuestion--;
    const prevQ = document.querySelector(`.mobile-question[data-question="${currentQuestion}"]`);
    if (prevQ) {
        prevQ.classList.add('active');
        prevQ.style.display = 'block';
    }

    // Update progress dots
    updateProgressDots();

    // Update navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (prevBtn) prevBtn.disabled = currentQuestion === 1;
    if (nextBtn) nextBtn.style.display = 'block';

    // Handle mobile submit button
    const mobileSubmitBtn = document.getElementById('mobile-submit-btn');
    if (mobileSubmitBtn) {
        mobileSubmitBtn.style.display = 'none';
    }
}

function updateProgressDots() {
    const dots = document.querySelectorAll('.progress-dots .dot');
    dots.forEach((dot, index) => {
        if (index < currentQuestion) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

export function resetContactForm() {
    // Reset form
    const form = document.getElementById('interactive-contact-form');
    if (form) {
        form.reset();
    }

    // Reset to first question (both desktop and mobile)
    document.querySelectorAll('.quest-question').forEach(q => q.classList.remove('active'));
    document.querySelectorAll('.desktop-question, .mobile-question').forEach(q => {
        q.classList.remove('active');
        q.style.display = 'none';
    });

    // Show first question in both layouts
    document.querySelector('.desktop-question[data-question="1"]').classList.add('active');
    const firstMobileQ = document.querySelector('.mobile-question[data-question="1"]');
    if (firstMobileQ) {
        firstMobileQ.classList.add('active');
        firstMobileQ.style.display = 'block';
    }
    currentQuestion = 1;

    // Reset navigation
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const mobileSubmitBtn = document.getElementById('mobile-submit-btn');

    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.style.display = 'block';
    if (mobileSubmitBtn) mobileSubmitBtn.style.display = 'none';

    updateProgressDots();

    // Show form again
    const questForm = document.querySelector('.contact-quest-form');
    const questIntro = document.querySelector('.contact-quest-intro');
    const formSuccess = document.getElementById('form-success');

    if (questForm) questForm.style.display = 'block';
    if (questIntro) questIntro.style.display = 'block';
    if (formSuccess) formSuccess.style.display = 'none';
}

// Handle form submission
export function initializeContactFormSubmit() {
    // Try to find the form with a delay to ensure DOM is loaded
    const findForm = () => {
        const form = document.getElementById('interactive-contact-form');
        if (form) {
            setupFormHandler(form);
        } else {
            setTimeout(findForm, 100);
        }
    };

    const setupFormHandler = (form) => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Sync values between desktop and mobile fields before submission
            const mobileMessage = form.querySelector('textarea[name="message"]');
            const desktopMessage = form.querySelector('textarea[name="message-desktop"]');
            if (mobileMessage && desktopMessage) {
                // Sync whichever has content to the other
                if (mobileMessage.value.trim()) {
                    desktopMessage.value = mobileMessage.value;
                } else if (desktopMessage.value.trim()) {
                    mobileMessage.value = desktopMessage.value;
                }
            }

            const mobileName = form.querySelector('input[name="name"]');
            const desktopName = form.querySelector('input[name="name-desktop"]');
            if (mobileName && desktopName) {
                if (mobileName.value.trim()) {
                    desktopName.value = mobileName.value;
                } else if (desktopName.value.trim()) {
                    mobileName.value = desktopName.value;
                }
            }

            const mobileEmail = form.querySelector('input[name="email"]');
            const desktopEmail = form.querySelector('input[name="email-desktop"]');
            if (mobileEmail && desktopEmail) {
                if (mobileEmail.value.trim()) {
                    desktopEmail.value = mobileEmail.value;
                } else if (desktopEmail.value.trim()) {
                    mobileEmail.value = desktopEmail.value;
                }
            }

            const mobileOrg = form.querySelector('input[name="organization"]');
            const desktopOrg = form.querySelector('input[name="organization-desktop"]');
            if (mobileOrg && desktopOrg) {
                if (mobileOrg.value.trim()) {
                    desktopOrg.value = mobileOrg.value;
                } else if (desktopOrg.value.trim()) {
                    mobileOrg.value = desktopOrg.value;
                }
            }

            // Validate that required fields are filled
            const message = mobileMessage?.value.trim() || desktopMessage?.value.trim();
            const name = mobileName?.value.trim() || desktopName?.value.trim();
            const email = mobileEmail?.value.trim() || desktopEmail?.value.trim();

            if (!message || !name || !email) {
                alert('Please fill in all required fields (message, name, and email).');
                return;
            }

            // Collect form data
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                // Handle both desktop and mobile field names
                if (key.includes('-desktop')) {
                    const baseKey = key.replace('-desktop', '');
                    data[baseKey] = value;
                } else if (!key.includes('-desktop')) {
                    data[key] = value;
                }
            });

            // Create email body with translated labels
            const purposeLabel = getTranslation('contact-q1') || 'Purpose';
            const industryLabel = getTranslation('contact-q2') || 'Interest Area';
            const timelineLabel = getTranslation('contact-q3') || 'Timeline';
            const nameLabel = getTranslation('contact-name') || 'Name';
            const emailLabel = getTranslation('contact-email') || 'Email';
            const orgLabel = getTranslation('contact-org') || 'Organization';
            const messageLabel = getTranslation('contact-q4') || 'Message';

            const emailBody = `
${purposeLabel}: ${data.purpose}
${industryLabel}: ${data.industry || data.interest}
${timelineLabel}: ${data.timeline}
${nameLabel}: ${data.name}
${emailLabel}: ${data.email}
${orgLabel}: ${data.organization || 'N/A'}

${messageLabel}:
${data.message}
            `.trim();

            // Create mailto link
            const questSubject = getTranslation('quest-email-subject') || 'Contact Quest:';
            const subject = `${questSubject} ${data.purpose} - ${data.industry || data.interest}`;
            const mailtoLink = `mailto:hugues.ii.w.b.depingon@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

            // Open email client
            window.location.href = mailtoLink;

            // Show success message
            setTimeout(() => {
                const questForm = document.querySelector('.contact-quest-form');
                const questIntro = document.querySelector('.contact-quest-intro');
                const formSuccess = document.getElementById('form-success');

                if (questForm) questForm.style.display = 'none';
                if (questIntro) questIntro.style.display = 'none';
                if (formSuccess) formSuccess.style.display = 'block';
            }, 500);
        });

        // Add auto-advance functionality for mobile radio buttons
        const radioButtons = form.querySelectorAll('.mobile-question input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', function() {
                // Small delay to allow the selection to be visible
                setTimeout(() => {
                    // Only auto-advance on mobile and for questions 1-3 (not message or contact info)
                    if (window.innerWidth <= 768 && currentQuestion < 4) {
                        nextQuestion();
                    }
                }, 300);
            });
        });

        // Add auto-advance for textarea when user types (question 4)
        const messageTextarea = form.querySelector('.mobile-question textarea[name="message"]');
        if (messageTextarea) {
            let typingTimer;
            messageTextarea.addEventListener('input', function() {
                clearTimeout(typingTimer);
                // Auto-advance after user stops typing for 2 seconds
                typingTimer = setTimeout(() => {
                    if (window.innerWidth <= 768 && currentQuestion === 4 && this.value.trim().length > 10) {
                        nextQuestion();
                    }
                }, 2000);
            });
        }

        // Sync values between desktop and mobile fields
        const syncFields = () => {
            // Sync message fields
            const desktopMessage = form.querySelector('textarea[name="message-desktop"]');
            const mobileMessage = form.querySelector('textarea[name="message"]');
            if (desktopMessage && mobileMessage) {
                desktopMessage.addEventListener('input', () => {
                    mobileMessage.value = desktopMessage.value;
                });
                mobileMessage.addEventListener('input', () => {
                    desktopMessage.value = mobileMessage.value;
                });
            }

            // Sync contact fields
            const desktopName = form.querySelector('input[name="name-desktop"]');
            const mobileName = form.querySelector('input[name="name"]');
            if (desktopName && mobileName) {
                desktopName.addEventListener('input', () => {
                    mobileName.value = desktopName.value;
                });
                mobileName.addEventListener('input', () => {
                    desktopName.value = mobileName.value;
                });
            }

            const desktopEmail = form.querySelector('input[name="email-desktop"]');
            const mobileEmail = form.querySelector('input[name="email"]');
            if (desktopEmail && mobileEmail) {
                desktopEmail.addEventListener('input', () => {
                    mobileEmail.value = desktopEmail.value;
                });
                mobileEmail.addEventListener('input', () => {
                    desktopEmail.value = mobileEmail.value;
                });
            }

            const desktopOrg = form.querySelector('input[name="organization-desktop"]');
            const mobileOrg = form.querySelector('input[name="organization"]');
            if (desktopOrg && mobileOrg) {
                desktopOrg.addEventListener('input', () => {
                    mobileOrg.value = desktopOrg.value;
                });
                mobileOrg.addEventListener('input', () => {
                    desktopOrg.value = mobileOrg.value;
                });
            }
        };

        syncFields();

        // Add direct click handlers to submit buttons as fallback
        const submitButtons = form.querySelectorAll('button[type="submit"]');
        submitButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                // Trigger form submission manually
                form.dispatchEvent(new Event('submit'));
            });
        });
    };

    findForm();
}

