function toast(msg){
  const wrap = document.getElementById('toasts') || (()=>{ const d=document.createElement('div'); d.className='toast space-y-2'; d.id='toasts'; document.body.appendChild(d); return d; })();
  const t = document.createElement('div');
  t.className = 'rounded-xl bg-black/80 text-white px-4 py-2 shadow-soft';
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(()=> t.remove(), 2500);
}

function money(n){ try{ return new Intl.NumberFormat('en-IN', {style:'currency', currency:'INR', maximumFractionDigits:0}).format(n); }catch(_){ return '₹'+n; } }

async function getMe(){
  try{
    const res = await fetch('/api/auth/me');
    if (!res.ok) return null;
    const { user } = await res.json();
    return user;
  }catch(_){ return null; }
}

async function setupNavbar(){
  const user = await getMe();
  const nav = document.getElementById('nav-right');
  if (!nav) return;
  const path = location.pathname;
  if (user){
    nav.innerHTML = `
      <a href="/" class="text-sm px-3 py-2 rounded-lg hover:bg-gray-100 ${path==='/'?'bg-gray-100':''}">Explore</a>
      <a href="/my-bids.html" class="text-sm px-3 py-2 rounded-lg hover:bg-gray-100 ${path.includes('my-bids')?'bg-gray-100':''}">My Bids</a>
      <a href="/sell-item.html" class="text-sm px-3 py-2 rounded-lg hover:bg-gray-100 ${path.includes('sell-item')?'bg-gray-100':''}">Sell Item</a>
      <span class="hidden sm:inline text-sm text-gray-600">Hi, ${user.name}</span>
      <button id="logoutBtn" class="text-sm px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Logout</button>
    `;
    document.getElementById('logoutBtn').addEventListener('click', async ()=>{
      await fetch('/api/auth/logout', { method:'POST' });
      location.href = '/';
    });
  }else{
    nav.innerHTML = `
      <a href="/" class="text-sm px-3 py-2 rounded-lg hover:bg-gray-100 ${path==='/'?'bg-gray-100':''}">Explore</a>
      <a href="/login.html" class="text-sm px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Login</a>
      <a href="/signup.html" class="text-sm px-3 py-2 rounded-lg">Sign Up</a>`;
  }
}
document.addEventListener('DOMContentLoaded', setupNavbar);
