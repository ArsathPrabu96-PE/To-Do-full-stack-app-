(function(){
  const API = 'http://127.0.0.1:3000/auth';

  function $(s){return document.querySelector(s)}

  async function signup(event){
    event.preventDefault();
    const email = $('#signup-form #email').value.trim();
    const password = $('#signup-form #password').value;
    const confirm = $('#signup-form #password-confirm').value;
    const msg = $('#signup-msg');
    msg.textContent = '';
    if(password !== confirm){ msg.textContent = 'Passwords do not match'; return; }
    // show loading 3D spinner
    const spinner = document.getElementById('pw-loading');
    if(spinner){ spinner.classList.remove('hidden'); spinner.setAttribute('aria-hidden','false'); }
    try{
      const res = await fetch(API + '/signup', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if(!res.ok){ msg.textContent = data.error || 'Signup failed'; return; }
      // Do NOT auto-login. Redirect user to login page after signup success
      msg.textContent = 'Account created. Redirecting to login...';
      setTimeout(()=> location.href='login.html', 900);
    }catch(err){ msg.textContent = 'Network error'; console.error(err); }
    finally{ if(spinner){ spinner.classList.add('hidden'); spinner.setAttribute('aria-hidden','true'); } }
  }

  async function login(event){
    event.preventDefault();
    const email = $('#login-form #email').value.trim();
    const password = $('#login-form #password').value;
    const msg = $('#login-msg');
    msg.textContent = '';
    try{
      const res = await fetch(API + '/login', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if(!res.ok){ msg.textContent = data.error || 'Login failed'; return; }
      localStorage.setItem('token', data.token);
      msg.textContent = 'Login successful. Redirecting...';
      setTimeout(()=> location.href='index.html', 600);
    }catch(err){ msg.textContent = 'Network error'; console.error(err); }
  }

  // Password strength helper (very small heuristic)
  function passwordStrength(pw){
    let score = 0;
    if(!pw) return {score, label: 'Too short'};
    if(pw.length >= 8) score += 1;
    if(/[A-Z]/.test(pw)) score += 1;
    if(/[0-9]/.test(pw)) score += 1;
    if(/[^A-Za-z0-9]/.test(pw)) score += 1;
    const labels = ['Very weak','Weak','Okay','Strong','Very strong'];
    return { score, label: labels[Math.min(score, labels.length-1)] };
  }

  // Toggle show password buttons
  function initShowPassword(){
    document.querySelectorAll('.show-pass-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = document.querySelector(btn.dataset.target);
        if(!target) return;
        if(target.type === 'password'){ target.type = 'text'; btn.textContent = '🙈'; }
        else { target.type = 'password'; btn.textContent = '👁️'; }
      });
    });
  }

  function initPasswordMeter(){
    const pw = document.querySelector('#signup-form #password');
    const meter = document.getElementById('pw-strength');
    if(!pw || !meter) return;
    const bar = meter.querySelector('.strength-bar');
    const label = meter.querySelector('.strength-label');
    pw.addEventListener('input', ()=>{
      const {score,label:txt} = passwordStrength(pw.value);
      const pct = (score/4) * 100;
      bar.style.width = pct + '%';
      if(score <= 1) bar.style.background = 'linear-gradient(90deg,#ff4d4d,#ff7b7b)';
      else if(score === 2) bar.style.background = 'linear-gradient(90deg,#ffb84d,#ffd27a)';
      else if(score === 3) bar.style.background = 'linear-gradient(90deg,#9be15d,#00b09b)';
      else bar.style.background = 'linear-gradient(90deg,#2ed573,#1dd1a1)';
      label.textContent = txt;
    });
  }

  function initForgotPassword(){
    const link = document.getElementById('forgot-password');
    if(!link) return;
    link.addEventListener('click', (e)=>{
      e.preventDefault();
      const email = prompt('Enter your email to reset password:');
      if(!email) return alert('Email required');
      // Simple UX placeholder: show message. Real implementation requires backend email flow.
      alert('If that email exists, a password reset link would be sent (not implemented).');
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const sf = $('#signup-form');
    const lf = $('#login-form');
    if(sf) sf.addEventListener('submit', signup);
    if(lf) lf.addEventListener('submit', login);
    initShowPassword();
    initPasswordMeter();
    initForgotPassword();
  });
})();
