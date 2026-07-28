import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  AlertCircle,
  Calendar,
  CreditCard,
  LayoutDashboard,
  PieChart as PieIcon,
  Settings,
  Trash2,
  Edit2,
  CheckCircle2,
  Trophy,
  DollarSign,
  Search,
  Filter,
  Coins,
  X,
  User,
  LogOut,
  ShieldCheck,
  Bell,
  Database
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const API_BASE_URL = 'https://expense-tracker-dashboard-fm9d.onrender.com/api';

const CATEGORY_COLORS = {
  Housing: '#3b82f6',
  Groceries: '#10b981',
  Utilities: '#f59e0b',
  Entertainment: '#8b5cf6',
  Salary: '#22c55e',
  'Side Hustle': '#06b6d4',
  Savings: '#059669',
  Other: '#6b7280',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Authentication State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('wealthflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authModal, setAuthModal] = useState(null);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'EXPENSE',
    category: 'Groceries',
    customCategory: ''
  });

  useEffect(() => {
    if (user && (user.id || user._id)) {
      fetchAllUserData(user.id || user._id);
    } else {
      setTransactions([]);
      setGoals([]);
      setBudgets([]);
      setSubscriptions([]);
    }
  }, [user]);

  const fetchAllUserData = async (userId) => {
    setIsLoading(true);
    try {
      const [txRes, goalRes, budgetRes, subRes] = await Promise.all([
        fetch(`${API_BASE_URL}/transactions?userId=${userId}`),
        fetch(`${API_BASE_URL}/goals?userId=${userId}`),
        fetch(`${API_BASE_URL}/budgets?userId=${userId}`),
        fetch(`${API_BASE_URL}/subscriptions?userId=${userId}`)
      ]);

      const txData = await txRes.json();
      const goalData = await goalRes.json();
      const budgetData = await budgetRes.json();
      const subData = await subRes.json();

      if (txData.success) setTransactions(txData.data);
      if (goalData.success) setGoals(goalData.data);
      if (budgetData.success) setBudgets(budgetData.data);
      if (subData.success) setSubscriptions(subData.data);
    } catch (err) {
      console.error('Failed to load user financial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);

    const isLogin = authModal === 'login';
    const endpoint = isLogin ? `${API_BASE_URL}/auth/login` : `${API_BASE_URL}/auth/register`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin
          ? { email: authForm.email, password: authForm.password }
          : authForm
        )
      });

      const data = await res.json();

      if (data.success) {
        const userData = data.user;
        setUser(userData);
        localStorage.setItem('wealthflow_user', JSON.stringify(userData));
        setAuthModal(null);
        setAuthForm({ name: '', email: '', password: '' });
      } else {
        setAuthError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setAuthError('Connection server error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('wealthflow_user');
    setTransactions([]);
    setGoals([]);
    setBudgets([]);
    setSubscriptions([]);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to save transactions.');
      setAuthModal('login');
      return;
    }

    if (!formData.title || !formData.amount) return;

    const finalCategory = formData.category === 'Other'
      ? (formData.customCategory.trim() || 'Other')
      : formData.category;

    try {
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id || user._id,
          title: formData.title,
          amount: parseFloat(formData.amount),
          type: formData.type,
          category: finalCategory
        })
      });

      const data = await res.json();
      if (data.success) {
        setTransactions([data.data, ...transactions]);
        setFormData({ title: '', amount: '', type: 'EXPENSE', category: 'Groceries', customCategory: '' });
      }
    } catch (err) {
      console.error('Failed to create transaction:', err);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTransactions(transactions.filter(t => (t._id || t.id) !== id));
      }
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  const handleAddNewSubscription = async () => {
    if (!user) {
      alert('Please log in to manage subscriptions.');
      setAuthModal('login');
      return;
    }

    const title = prompt('Enter Bill / Subscription Name (e.g., Spotify):');
    if (!title) return;
    const amount = prompt('Enter Bill Amount ($):');
    if (!amount || isNaN(amount)) return;
    const dueDate = prompt('Enter Due Date (e.g., Aug 15, 2026):', 'Aug 15, 2026');
    if (!dueDate) return;

    try {
      const res = await fetch(`${API_BASE_URL}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id || user._id, title, amount: parseFloat(amount), dueDate, status: 'Pending' })
      });
      const data = await res.json();
      if (data.success) {
        setSubscriptions([...subscriptions, data.data]);
      }
    } catch (err) {
      console.error('Failed to add subscription:', err);
    }
  };

  const handleToggleBillStatus = async (subId) => {
    const targetBill = subscriptions.find(s => (s._id || s.id) === subId);
    if (!targetBill) return;

    const newStatus = targetBill.status === 'Pending' ? 'Paid' : 'Pending';

    try {
      const res = await fetch(`${API_BASE_URL}/subscriptions/${subId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setSubscriptions(subscriptions.map(s => ((s._id || s.id) === subId ? data.data : s)));
      }

      if (newStatus === 'Paid' && user) {
        await fetch(`${API_BASE_URL}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id || user._id,
            title: targetBill.title,
            amount: targetBill.amount,
            type: 'EXPENSE',
            category: 'Utilities'
          })
        });
        fetchAllUserData(user.id || user._id);
      }
    } catch (err) {
      console.error('Failed to update bill status:', err);
    }
  };

  const handleAddNewGoal = async () => {
    if (!user) {
      alert('Please log in to add savings goals.');
      setAuthModal('login');
      return;
    }

    const name = prompt('Enter Goal Name (e.g., Car Deposit):');
    if (!name) return;
    const target = prompt('Enter Target Amount ($):');
    if (!target || isNaN(target)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id || user._id, name, target: parseFloat(target), current: 0, color: '#3b82f6' })
      });
      const data = await res.json();
      if (data.success) {
        setGoals([...goals, data.data]);
      }
    } catch (err) {
      console.error('Failed to add goal:', err);
    }
  };

  const handleDepositToGoal = async (goalId) => {
    if (!user) {
      alert('Please log in.');
      setAuthModal('login');
      return;
    }

    const targetGoal = goals.find(g => (g._id || g.id) === goalId);
    if (!targetGoal) return;

    const deposit = prompt(`Deposit money toward "${targetGoal.name}" ($):`);
    if (!deposit || isNaN(deposit)) return;
    const amount = parseFloat(deposit);

    const newCurrent = targetGoal.current + amount;

    try {
      await fetch(`${API_BASE_URL}/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current: newCurrent })
      });

      // Saving to a goal is an EXPENSE/TRANSFER out of main cash
      await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id || user._id,
          title: `Saved for ${targetGoal.name}`,
          amount,
          type: 'EXPENSE',
          category: 'Savings'
        })
      });

      fetchAllUserData(user.id || user._id);
    } catch (err) {
      console.error('Failed deposit:', err);
    }
  };

  const handleWithdrawFromGoal = async (goalId) => {
    if (!user) return;
    const targetGoal = goals.find(g => (g._id || g.id) === goalId);
    if (!targetGoal) return;

    const withdraw = prompt(`Withdraw from "${targetGoal.name}" ($):`);
    if (!withdraw || isNaN(withdraw)) return;
    const amount = parseFloat(withdraw);
    const newCurrent = Math.max(0, targetGoal.current - amount);

    try {
      await fetch(`${API_BASE_URL}/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current: newCurrent })
      });

      // 🎯 FIXED: Set type to 'TRANSFER' so it doesn't inflate Monthly Income
      await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id || user._id,
          title: `Withdrew from ${targetGoal.name}`,
          amount,
          type: 'TRANSFER',
          category: 'Savings'
        })
      });

      fetchAllUserData(user.id || user._id);
    } catch (err) {
      console.error('Failed withdrawal:', err);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Delete this goal?')) {
      try {
        await fetch(`${API_BASE_URL}/goals/${goalId}`, { method: 'DELETE' });
        setGoals(goals.filter(g => (g._id || g.id) !== goalId));
      } catch (err) {
        console.error('Failed to delete goal:', err);
      }
    }
  };

  const handleEditBudgetLimit = async (categoryName) => {
    if (!user) {
      alert('Please log in to edit budgets.');
      setAuthModal('login');
      return;
    }

    const budgetItem = budgets.find(b => b.category === categoryName);
    const currentLimit = budgetItem ? budgetItem.limit : 100;

    const newLimit = prompt(`Enter new monthly budget limit for ${categoryName}:`, currentLimit);
    if (!newLimit || isNaN(newLimit)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id || user._id, category: categoryName, limit: parseFloat(newLimit) })
      });
      const data = await res.json();
      if (data.success) {
        setBudgets(prev => {
          const exists = prev.some(b => b.category === categoryName);
          if (exists) return prev.map(b => b.category === categoryName ? data.data : b);
          return [...prev, data.data];
        });
      }
    } catch (err) {
      console.error('Failed to update budget limit:', err);
    }
  };

  // Metric Calculations (Only counts 'INCOME' type transactions for income)
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + Number(t.amount), 0);
  const netWorth = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0;
  const lifetimeSavings = goals.reduce((acc, g) => acc + Number(g.current), 0);

  const categoryData = transactions
    .filter(t => t.type === 'EXPENSE' && t.category !== 'Savings')
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.name === curr.category);
      if (existing) { existing.value += Number(curr.amount); }
      else { acc.push({ name: curr.category, value: Number(curr.amount) }); }
      return acc;
    }, [])
    .map(item => ({ ...item, value: Number(item.value.toFixed(2)) }));

  const dbCategories = transactions.map(t => t.category).filter(Boolean);
  const defaultCategories = ['Groceries', 'Housing', 'Utilities', 'Entertainment', 'Salary', 'Side Hustle', 'Savings'];
  const uniqueDynamicCategories = Array.from(new Set([...defaultCategories, ...dbCategories]));

  const defaultExpenseCategories = ['Housing', 'Groceries', 'Utilities', 'Entertainment'];
  const userExpenseCategories = transactions.filter(t => t.type === 'EXPENSE' && t.category !== 'Savings').map(t => t.category).filter(Boolean);
  const allBudgetExpenseCategories = Array.from(new Set([...defaultExpenseCategories, ...userExpenseCategories]));

  const filteredTransactions = transactions.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterCategory === 'ALL') return matchesSearch;
    if (filterCategory === 'TOTAL_INCOME') return matchesSearch && item.type === 'INCOME';
    if (filterCategory === 'TOTAL_EXPENSE') return matchesSearch && item.type === 'EXPENSE';
    return matchesSearch && item.category === filterCategory;
  });

  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container { font-family: system-ui, -apple-system, sans-serif; background-color: #f8fafc; min-height: 100vh; width: 100%; box-sizing: border-box; }
        .clean-navbar { display: flex; align-items: center; justify-content: space-between; background-color: #ffffff; padding: 14px 48px; border-bottom: 1px solid #eaebf0; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03); }
        .nav-brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 20px; color: #0f172a; letter-spacing: -0.5px; cursor: pointer; }
        .brand-icon-box { background-color: #2563eb; color: #ffffff; padding: 6px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .right-nav-container { display: flex; align-items: center; gap: 20px; }
        .nav-menu-links { display: flex; align-items: center; gap: 4px; background-color: #f1f5f9; padding: 4px; border-radius: 10px; }
        .nav-link-item { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; padding: 7px 16px; border-radius: 8px; color: #64748b; background: none; border: none; cursor: pointer; transition: all 0.2s ease-in-out; }
        .nav-link-item:hover { color: #0f172a; }
        .nav-link-item.active { background-color: #ffffff; color: #0f172a; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
        .nav-actions { display: flex; align-items: center; gap: 14px; }
        .sign-in-btn { font-size: 14px; font-weight: 600; color: #475569; background: none; border: none; cursor: pointer; }
        .log-in-pill-btn { background-color: #0f172a; color: #ffffff; border: none; padding: 8px 20px; border-radius: 30px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
        .log-in-pill-btn:hover { background-color: #1e293b; }
        .user-badge { display: flex; align-items: center; gap: 8px; background-color: #eff6ff; color: #1d4ed8; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-card { background-color: #ffffff; border-radius: 16px; padding: 28px; width: 100%; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); position: relative; }
        .main-content-body { max-width: 1180px; margin: 28px auto 0 auto; padding: 0 32px; box-sizing: border-box; }
        .grid-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .grid-two-col { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 24px; }
        .search-filter-row { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
      `}</style>

      {/* Navbar */}
      <nav className="clean-navbar">
        <div className="nav-brand">
          <div className="brand-icon-box"><Coins size={20} color="#ffffff" /></div>
          <span>WealthFlow</span>
        </div>

        <div className="right-nav-container">
          <div className="nav-menu-links">
            <button onClick={() => setActiveTab('dashboard')} className={`nav-link-item ${activeTab === 'dashboard' ? 'active' : ''}`}><LayoutDashboard size={15} /> Overview</button>
            <button onClick={() => setActiveTab('analytics')} className={`nav-link-item ${activeTab === 'analytics' ? 'active' : ''}`}><PieIcon size={15} /> Analytics</button>
            <button onClick={() => setActiveTab('settings')} className={`nav-link-item ${activeTab === 'settings' ? 'active' : ''}`}><Settings size={15} /> Settings</button>
          </div>

          <div className="nav-actions">
            {user ? (
              <div className="user-badge">
                <User size={14} />
                <span>{user.name}</span>
                <button onClick={handleLogout} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', padding: '2px', marginLeft: '4px' }} title="Log out"><LogOut size={14} /></button>
              </div>
            ) : (
              <>
                <button onClick={() => setAuthModal('signin')} className="sign-in-btn">Sign in</button>
                <button onClick={() => setAuthModal('login')} className="log-in-pill-btn">Log in</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      {authModal && (
        <div className="modal-overlay" onClick={() => setAuthModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button onClick={() => setAuthModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>{authModal === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px 0' }}>Access your personal Smart Wealth Dashboard</p>

            {authError && <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '14px' }}>{authError}</div>}

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {authModal === 'signin' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Full Name</label>
                  <input type="text" placeholder="John Doe" value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} required />
                </div>
              )}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Email Address</label>
                <input type="email" placeholder="name@example.com" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Password</label>
                <input type="password" placeholder="••••••••" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} required />
              </div>
              <button type="submit" disabled={isAuthLoading} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '6px' }}>
                {isAuthLoading ? 'Processing...' : (authModal === 'login' ? 'Log in' : 'Create Account')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content-body">
        {activeTab === 'dashboard' && (
          <>
            {!user && (
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', color: '#1e40af' }}><strong>Logged in as Guest:</strong> Log in or Sign in to load and save your personal financial data.</div>
                <button onClick={() => setAuthModal('login')} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Log In Now</button>
              </div>
            )}

            {/* Overview Cards */}
            <div className="grid-cards">
              <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px', fontSize: '13px' }}><span>Total Net Worth</span><Wallet size={16} color="#2563eb" /></div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: netWorth >= 0 ? '#0f172a' : '#ef4444' }}>${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px', fontSize: '13px' }}><span>Lifetime Savings</span><DollarSign size={16} color="#059669" /></div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#059669' }}>${lifetimeSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px', fontSize: '13px' }}><span>Monthly Income</span><TrendingUp size={16} color="#10b981" /></div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#10b981' }}>+${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px', fontSize: '13px' }}><span>Monthly Expenses</span><TrendingDown size={16} color="#ef4444" /></div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#ef4444' }}>-${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px', fontSize: '13px' }}><span>Savings Rate</span><PiggyBank size={16} color="#8b5cf6" /></div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#8b5cf6' }}>{savingsRate}%</h2>
              </div>
            </div>

            {/* Charts */}
            <div className="grid-two-col">
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px', color: '#0f172a' }}>Financial Cash Flow</h3>
                <div style={{ width: '100%', height: '240px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ name: 'Current Month', Income: totalIncome, Expense: totalExpense }]}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                      <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px', color: '#0f172a' }}>Expense Breakdown</h3>
                <div style={{ width: '100%', height: '240px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData.length > 0 ? categoryData : [{ name: 'None', value: 1 }]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ value, percent }) => categoryData.length > 0 ? `$${Number(value).toFixed(2)} (${(percent * 100).toFixed(1)}%)` : ''}>
                        {categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.Other} />))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Form & Activity Feed */}
            <div className="grid-two-col">
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px', color: '#0f172a' }}>Log New Transaction</h3>
                <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" placeholder="Description (e.g., Grocery store)" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
                  <input type="number" step="0.01" placeholder="Amount ($)" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ flex: 1, minWidth: '120px', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}>
                      <option value="EXPENSE">Expense</option>
                      <option value="INCOME">Income</option>
                    </select>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ flex: 1, minWidth: '120px', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}>
                      <option value="Groceries">Groceries</option>
                      <option value="Housing">Housing</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Salary">Salary</option>
                      <option value="Side Hustle">Side Hustle</option>
                      <option value="Other">Other (Custom)</option>
                    </select>
                  </div>
                  {formData.category === 'Other' && (
                    <input type="text" placeholder="Specify Custom Category Name" value={formData.customCategory} onChange={e => setFormData({ ...formData, customCategory: e.target.value })} style={{ padding: '10px', border: '1px solid #3b82f6', borderRadius: '6px', backgroundColor: '#eff6ff', fontSize: '14px' }} required />
                  )}
                  <button type="submit" style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' }}>Save Transaction</button>
                </form>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#0f172a' }}>Recent Activity Feed</h3>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#16a34a', backgroundColor: '#dcfce7', padding: '3px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '5px', height: '5px', backgroundColor: '#16a34a', borderRadius: '50%' }}></span> Live Sync</span>
                </div>

                <div className="search-filter-row">
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search description..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '8px 8px 8px 30px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ position: 'relative', minWidth: '140px' }}>
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ width: '100%', padding: '8px 8px 8px 26px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: '500', cursor: 'pointer' }}>
                      <option value="ALL">All Activity</option>
                      <option value="TOTAL_INCOME">Total Income (+)</option>
                      <option value="TOTAL_EXPENSE">Total Expense (-)</option>
                      {uniqueDynamicCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                    <Filter size={13} color="#64748b" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>

                {isLoading ? <p style={{ color: '#64748b', fontSize: '13px' }}>Loading transaction feed...</p> : filteredTransactions.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>{user ? 'No transactions found.' : 'Log in to view your activity feed.'}</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                    {filteredTransactions.map(item => {
                      const itemId = item._id || item.id;
                      const formattedDate = item.date ? new Date(item.date).toLocaleDateString() : 'Today';
                      return (
                        <div key={itemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                          <div>
                            <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '13px' }}>{item.title}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{item.category} • {formattedDate}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '13px', color: item.type === 'INCOME' ? '#10b981' : item.type === 'TRANSFER' ? '#3b82f6' : '#ef4444' }}>
                              {item.type === 'INCOME' ? '+' : item.type === 'TRANSFER' ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
                            </div>
                            <button onClick={() => handleDeleteTransaction(itemId)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px', color: '#94a3b8' }} title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Savings & Wealth Goals Section */}
            <div style={{ backgroundColor: '#fff', padding: '22px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Target size={20} color="#2563eb" /><h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#0f172a' }}>Savings & Wealth Goals</h3></div>
                <button onClick={handleAddNewGoal} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>+ New Goal</button>
              </div>

              {goals.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>{user ? 'No active savings goals found.' : 'Log in to view or set up savings goals.'}</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  {goals.map(goal => {
                    const goalId = goal._id || goal.id;
                    const percentage = Math.min(100, Math.round((goal.current / goal.target) * 100));
                    const isAchieved = goal.current >= goal.target;

                    return (
                      <div key={goalId} style={{ border: isAchieved ? '1px solid #86efac' : '1px solid #e2e8f0', backgroundColor: isAchieved ? '#f0fdf4' : '#fff', borderRadius: '10px', padding: '14px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>{goal.name} {isAchieved && <Trophy size={15} color="#16a34a" />}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {isAchieved ? <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '12px' }}>Achieved!</span> : <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>{percentage}%</span>}
                            <button onClick={() => handleDepositToGoal(goalId)} style={{ border: 'none', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', borderRadius: '4px', padding: '2px 5px', fontSize: '10px' }} title="Deposit">+$</button>
                            <button onClick={() => handleWithdrawFromGoal(goalId)} style={{ border: 'none', backgroundColor: '#f59e0b', color: '#fff', cursor: 'pointer', borderRadius: '4px', padding: '2px 5px', fontSize: '10px' }} title="Withdraw">-$</button>
                            <button onClick={() => handleDeleteGoal(goalId)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete"><Trash2 size={13} /></button>
                          </div>
                        </div>
                        <div style={{ backgroundColor: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}><div style={{ backgroundColor: isAchieved ? '#16a34a' : goal.color, height: '100%', width: `${percentage}%` }}></div></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: isAchieved ? '#15803d' : '#64748b' }}>
                          <span>Saved: <strong>${goal.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                          <span>Target: ${goal.target.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Budgets & Subscriptions */}
            <div className="grid-two-col" style={{ marginBottom: '32px' }}>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}><AlertCircle size={18} color="#f59e0b" /><h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#0f172a' }}>Category Budgets</h3></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {allBudgetExpenseCategories.map((categoryName, idx) => {
                    const budgetObj = budgets.find(b => b.category === categoryName);
                    const limit = budgetObj ? budgetObj.limit : 100;
                    const spent = transactions.filter(t => t.type === 'EXPENSE' && t.category === categoryName).reduce((sum, t) => sum + Number(t.amount), 0);
                    const isOver = spent > limit;
                    const ratio = Math.min(100, Math.round((spent / limit) * 100));

                    return (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>{categoryName} <button onClick={() => handleEditBudgetLimit(categoryName)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }} title="Edit"><Edit2 size={12} /></button></span>
                          <span style={{ color: isOver ? '#ef4444' : '#64748b', fontWeight: isOver ? 'bold' : 'normal' }}>${spent.toFixed(2)} / ${limit.toFixed(2)} {isOver && '(Over Limit!)'}</span>
                        </div>
                        <div style={{ backgroundColor: '#f1f5f9', height: '7px', borderRadius: '4px', overflow: 'hidden' }}><div style={{ backgroundColor: isOver ? '#ef4444' : '#10b981', height: '100%', width: `${ratio}%` }}></div></div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={18} color="#8b5cf6" /><h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#0f172a' }}>Upcoming Subscriptions</h3></div>
                  <button onClick={handleAddNewSubscription} style={{ backgroundColor: '#8b5cf6', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>+ Add Bill</button>
                </div>
                {subscriptions.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>{user ? 'No subscriptions added.' : 'Log in to view subscriptions.'}</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {subscriptions.map(bill => {
                      const subId = bill._id || bill.id;
                      return (
                        <div key={subId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '6px' }}><CreditCard size={16} color="#64748b" /></div>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '13px', color: '#0f172a' }}>{bill.title}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>Due {bill.dueDate}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0f172a' }}>${bill.amount.toFixed(2)}</div>
                              <span style={{ fontSize: '10px', backgroundColor: bill.status === 'Paid' ? '#dcfce7' : '#fef3c7', color: bill.status === 'Paid' ? '#16a34a' : '#d97706', padding: '2px 5px', borderRadius: '4px', fontWeight: '600' }}>{bill.status}</span>
                            </div>
                            <button onClick={() => handleToggleBillStatus(subId)} style={{ backgroundColor: bill.status === 'Paid' ? '#e2e8f0' : '#10b981', color: bill.status === 'Paid' ? '#64748b' : '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>{bill.status === 'Paid' ? 'Paid' : 'Pay Now'}</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>Financial Health Analytics</h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px 0' }}>Comprehensive insights derived from MongoDB user records.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>TOTAL TRANSACTIONS</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>{transactions.length}</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>SAVINGS RATE</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>{savingsRate}%</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>System Settings</h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px 0' }}>Manage backend endpoints, alerts, and user profiles.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Database size={20} color="#2563eb" /><div><div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>Database Status</div><div style={{ fontSize: '12px', color: '#64748b' }}>Connected to MongoDB</div></div></div>
                <span style={{ fontSize: '12px', backgroundColor: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>Active</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}