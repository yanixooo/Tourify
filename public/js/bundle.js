/* eslint-disable */

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

// MAP FUNCTION
const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};

// FUNCTIONS
const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};

const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

const login = async (email, password) => {
  try {
    const res = await fetch('/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else {
      showAlert('error', data.message);
    }
  } catch (err) {
    showAlert('error', 'Error logging in! Try again.');
  }
};

const logout = async () => {
  try {
    const res = await fetch('/api/v1/users/logout');
    const data = await res.json();

    if (data.status === 'success') location.reload(true);
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
};

const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await fetch('/api/v1/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, passwordConfirm }),
    });

    const data = await res.json();

    if (data.status === 'success') {
      showAlert('success', 'Account created successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else {
      showAlert('error', data.message);
    }
  } catch (err) {
    showAlert('error', 'Error signing up! Try again.');
  }
};

const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (result.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    } else {
      showAlert('error', result.message);
    }
  } catch (err) {
    showAlert('error', 'Error updating! Try again.');
  }
};

// EVENT LISTENERS
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(name, email, password, passwordConfirm);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateSettings({ name, email }, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

// MAPBOX
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  if (locations && locations.length > 0) {
    displayMap(locations);
  }
}

// ================================
// MODERN UI ENHANCEMENTS
// ================================

// Scroll Animation with Intersection Observer
const initScrollAnimations = () => {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Animate only once
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    animatedElements.forEach(el => observer.observe(el));
  } else {
    // Fallback for older browsers
    animatedElements.forEach(el => el.classList.add('visible'));
  }
};

// Header Scroll Effect
const initHeaderScrollEffect = () => {
  const header = document.querySelector('.header');
  if (!header) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateHeader = () => {
    const scrollY = window.scrollY;

    if (scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScrollY = scrollY;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  });
};

// Scroll to Top Button
const initScrollToTop = () => {
  // Create scroll to top button if it doesn't exist
  let scrollBtn = document.querySelector('.scroll-top');
  if (!scrollBtn) {
    scrollBtn = document.createElement('button');
    scrollBtn.className = 'fab scroll-top';
    scrollBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
      </svg>
    `;
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollBtn);
  }

  // Show/hide on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  });

  // Scroll to top on click
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
};

// Image Lazy Loading
const initLazyImages = () => {
  const images = document.querySelectorAll('img[data-src]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
      }
    );

    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    images.forEach(img => {
      img.src = img.dataset.src;
      img.classList.add('loaded');
    });
  }
};

// Smooth scroll for anchor links
const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });
};

// Card hover parallax effect
const initCardParallax = () => {
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
};

// Button ripple effect
const initRippleEffect = () => {
  const buttons = document.querySelectorAll('.btn, .btn--green, .btn--small');

  buttons.forEach(button => {
    button.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });
};

// Auto-add animation classes to elements
const prepareAnimations = () => {
  // Add animation classes to cards
  document.querySelectorAll('.card').forEach((card, index) => {
    if (!card.classList.contains('animate-on-scroll')) {
      card.classList.add('animate-on-scroll');
      card.classList.add(`animate-delay-${(index % 5) + 1}`);
    }
  });

  // Add animation to section headers
  document.querySelectorAll('.heading-secondary').forEach(heading => {
    if (!heading.classList.contains('animate-on-scroll')) {
      heading.classList.add('animate-on-scroll');
    }
  });

  // Add animation to reviews
  document.querySelectorAll('.reviews__card').forEach((card, index) => {
    if (!card.classList.contains('animate-on-scroll')) {
      card.classList.add('animate-on-scroll');
      card.classList.add(`animate-delay-${(index % 5) + 1}`);
    }
  });
};

// Keyboard navigation support
const initKeyboardNav = () => {
  document.addEventListener('keydown', e => {
    // Escape key closes any open modals or alerts
    if (e.key === 'Escape') {
      const alert = document.querySelector('.alert');
      if (alert) hideAlert();
    }
  });
};

// Initialize all UI enhancements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  prepareAnimations();
  initScrollAnimations();
  initHeaderScrollEffect();
  initScrollToTop();
  initLazyImages();
  initSmoothScroll();
  initCardParallax();
  initRippleEffect();
  initKeyboardNav();
});

// Re-initialize animations after page transitions
window.addEventListener('pageshow', e => {
  if (e.persisted) {
    prepareAnimations();
    initScrollAnimations();
  }
});
