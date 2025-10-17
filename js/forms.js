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
    const currentQ = document.querySelector(`.quest-question[data-question="${currentQuestion}"]`);
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

    // Show next question
    currentQuestion++;
    document.querySelector(`.quest-question[data-question="${currentQuestion}"]`).classList.add('active');

    // Update progress dots
    updateProgressDots();

    // Update navigation buttons
    document.getElementById('prev-btn').disabled = false;

    if (currentQuestion === totalQuestions) {
        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('submit-btn').style.display = 'block';
    }
}

export function previousQuestion() {
    // Hide current question
    document.querySelector(`.quest-question[data-question="${currentQuestion}"]`).classList.remove('active');

    // Show previous question
    currentQuestion--;
    document.querySelector(`.quest-question[data-question="${currentQuestion}"]`).classList.add('active');

    // Update progress dots
    updateProgressDots();

    // Update navigation buttons
    if (currentQuestion === 1) {
        document.getElementById('prev-btn').disabled = true;
    }

    document.getElementById('next-btn').style.display = 'block';
    document.getElementById('submit-btn').style.display = 'none';
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

    // Reset to first question
    document.querySelectorAll('.quest-question').forEach(q => q.classList.remove('active'));
    document.querySelector('.quest-question[data-question="1"]').classList.add('active');
    currentQuestion = 1;

    // Reset navigation
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');

    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.style.display = 'block';
    if (submitBtn) submitBtn.style.display = 'none';

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
    const form = document.getElementById('interactive-contact-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Collect form data
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            // Create email body
            const emailBody = `
Purpose: ${data.purpose}
Interest Area: ${data.interest}
Timeline: ${data.timeline}
Name: ${data.name}
Email: ${data.email}
Organization: ${data.organization || 'N/A'}

Message:
${data.message}
            `.trim();

            // Create mailto link
            const questSubject = getTranslation('quest-email-subject');
            const subject = `${questSubject} ${data.purpose} - ${data.interest}`;
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
    }
}

