/* 前端共享工具：多语言、鉴权、API 封装、导航渲染 */
(function (global) {
  'use strict';

  // ---------- 多语言翻译表（与后端 app/i18n.py 保持一致） ----------
  var TRANSLATIONS = {
    zh: {
      home: '首页', products: '商品', cart: '购物车', orders: '我的订单',
      login: '登录', register: '注册', logout: '退出登录', admin: '管理后台',
      search: '搜索', search_placeholder: '搜索商品...',
      featured_products: '推荐商品', all_products: '全部商品',
      add_to_cart: '加入购物车', buy_now: '立即购买', price: '价格', stock: '库存',
      sku: '规格', total: '合计', quantity: '数量', checkout: '结算',
      receiver_name: '收货人', receiver_phone: '联系电话', receiver_address: '收货地址',
      remark: '备注', submit_order: '提交订单', pay_now: '立即支付',
      payment_method: '支付方式', order_no: '订单号', order_status: '订单状态',
      order_time: '下单时间', order_detail: '订单详情', empty_cart: '购物车是空的',
      go_shopping: '去逛逛', language: '语言', email: '邮箱', password: '密码',
      full_name: '姓名', phone: '手机号', mock_pay: '模拟支付', alipay: '支付宝',
      wechat: '微信支付', stripe: 'Stripe', pending: '待支付', paid: '已支付',
      shipped: '已发货', completed: '已完成', cancelled: '已取消', refunded: '已退款',
      status: '状态', actions: '操作', cancel_order: '取消订单',
      confirm_receipt: '确认收货', no_orders: '暂无订单', subtotal: '商品小计',
      shipping_fee: '运费', discount: '优惠', dashboard: '仪表盘', category: '分类',
      inventory: '库存', reports: '报表', settings: '设置', customers: '客户',
      welcome: '欢迎', products_count: '商品总数', orders_count: '订单总数',
      revenue: '营收', pending_orders: '待支付订单', customers_count: '客户总数',
      low_stock: '低库存商品', add_product: '新增商品', edit: '编辑', delete: '删除',
      save: '保存', cancel: '取消', back: '返回', loading: '加载中...',
      operation_success: '操作成功', operation_failed: '操作失败', confirm: '确认',
      not_logged_in: '请先登录', unit_price: '单价', no_account: '还没有账号？',
      have_account: '已有账号？', products_title: '商品列表', dashboard_title: '仪表盘',
      order_management: '订单管理', product_management: '商品管理',
      total_amount: '订单金额', unpaid: '未支付',
    },
    en: {
      home: 'Home', products: 'Products', cart: 'Cart', orders: 'My Orders',
      login: 'Login', register: 'Register', logout: 'Logout', admin: 'Admin',
      search: 'Search', search_placeholder: 'Search products...',
      featured_products: 'Featured Products', all_products: 'All Products',
      add_to_cart: 'Add to Cart', buy_now: 'Buy Now', price: 'Price', stock: 'Stock',
      sku: 'SKU', total: 'Total', quantity: 'Quantity', checkout: 'Checkout',
      receiver_name: 'Receiver', receiver_phone: 'Phone', receiver_address: 'Address',
      remark: 'Remark', submit_order: 'Submit Order', pay_now: 'Pay Now',
      payment_method: 'Payment Method', order_no: 'Order No.', order_status: 'Order Status',
      order_time: 'Order Time', order_detail: 'Order Detail', empty_cart: 'Your cart is empty',
      go_shopping: 'Go Shopping', language: 'Language', email: 'Email', password: 'Password',
      full_name: 'Full Name', phone: 'Phone', mock_pay: 'Mock Pay', alipay: 'Alipay',
      wechat: 'WeChat Pay', stripe: 'Stripe', pending: 'Pending', paid: 'Paid',
      shipped: 'Shipped', completed: 'Completed', cancelled: 'Cancelled', refunded: 'Refunded',
      status: 'Status', actions: 'Actions', cancel_order: 'Cancel Order',
      confirm_receipt: 'Confirm Receipt', no_orders: 'No orders yet', subtotal: 'Subtotal',
      shipping_fee: 'Shipping Fee', discount: 'Discount', dashboard: 'Dashboard', category: 'Categories',
      inventory: 'Inventory', reports: 'Reports', settings: 'Settings', customers: 'Customers',
      welcome: 'Welcome', products_count: 'Products', orders_count: 'Orders',
      revenue: 'Revenue', pending_orders: 'Pending Orders', customers_count: 'Customers',
      low_stock: 'Low Stock', add_product: 'Add Product', edit: 'Edit', delete: 'Delete',
      save: 'Save', cancel: 'Cancel', back: 'Back', loading: 'Loading...',
      operation_success: 'Success', operation_failed: 'Failed', confirm: 'Confirm',
      not_logged_in: 'Please login first', unit_price: 'Unit Price', no_account: 'No account yet?',
      have_account: 'Already have an account?', products_title: 'Products', dashboard_title: 'Dashboard',
      order_management: 'Orders', product_management: 'Products',
      total_amount: 'Order Amount', unpaid: 'Unpaid',
    },
  };

  // ---------- 语言管理 ----------
  function getLang() {
    var lang = localStorage.getItem('lang');
    if (!lang) {
      var m = document.cookie.match(/(?:^|; )lang=([^;]+)/);
      lang = m ? m[1] : 'zh';
    }
    return lang === 'zh' || lang === 'en' ? lang : 'zh';
  }

  function setLang(lang) {
    localStorage.setItem('lang', lang);
    document.cookie = 'lang=' + lang + '; path=/; max-age=31536000';
  }

  function t(key) {
    var lang = getLang();
    var table = TRANSLATIONS[lang] || TRANSLATIONS.zh;
    return table[key] !== undefined ? table[key] : (TRANSLATIONS.zh[key] || key);
  }

  // ---------- Token 管理 ----------
  function getToken() {
    var tok = localStorage.getItem('access_token');
    if (!tok) {
      var m = document.cookie.match(/(?:^|; )access_token=([^;]+)/);
      tok = m ? decodeURIComponent(m[1]) : null;
    }
    return tok;
  }
  function setToken(tok) {
    localStorage.setItem('access_token', tok);
    document.cookie = 'access_token=' + encodeURIComponent(tok) + '; path=/; max-age=604800';
  }
  function clearToken() {
    localStorage.removeItem('access_token');
    document.cookie = 'access_token=; path=/; max-age=0';
  }

  function getAdminToken() {
    var tok = localStorage.getItem('admin_token');
    if (!tok) {
      var m = document.cookie.match(/(?:^|; )admin_token=([^;]+)/);
      tok = m ? decodeURIComponent(m[1]) : null;
    }
    return tok;
  }
  function setAdminToken(tok) {
    localStorage.setItem('admin_token', tok);
    document.cookie = 'admin_token=' + encodeURIComponent(tok) + '; path=/; max-age=604800';
  }
  function clearAdminToken() {
    localStorage.removeItem('admin_token');
    document.cookie = 'admin_token=; path=/; max-age=0';
  }

  // ---------- API 封装 ----------
  function api(path, options) {
    options = options || {};
    var headers = options.headers || {};
    headers['Content-Type'] = 'application/json';
    if (options.token) {
      headers['Authorization'] = 'Bearer ' + options.token;
    }
    var query = options.includeLang === false ? '' : ((path.indexOf('?') >= 0 ? '&' : '?') + 'lang=' + getLang());
    return fetch(path + query, {
      method: options.method || 'GET',
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (res.ok) return data;
        var err = new Error(data.detail || data.message || ('HTTP ' + res.status));
        err.status = res.status;
        throw err;
      });
    });
  }

  // ---------- Toast ----------
  function toast(msg, type) {
    var el = document.createElement('div');
    el.className = 'toast ' + (type || 'success');
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2500);
  }

  // ---------- 状态徽章 ----------
  function badge(status) {
    return '<span class="badge badge-' + status + '">' + t(status) + '</span>';
  }

  // ---------- 金额格式化 ----------
  function money(v) {
    var n = Number(v);
    if (isNaN(n)) return '¥0.00';
    return '¥' + n.toFixed(2);
  }

  // ---------- 导航渲染 ----------
  function renderNav(active) {
    var token = getToken();
    var nav = document.getElementById('nav-links');
    if (!nav) return;
    var links = [
      { href: '/', key: 'home', label: t('home') },
      { href: '/orders.html', key: 'orders', label: t('orders') },
    ];
    var html = '<a href="/" class="' + (active === 'home' ? 'active' : '') + '">' + t('products') + '</a>'
      + '<a href="/orders.html" class="' + (active === 'orders' ? 'active' : '') + '">' + t('orders') + '</a>';
    nav.innerHTML = html;

    var actions = document.getElementById('nav-actions');
    if (!actions) return;
    var right = '';
    // 语言切换
    right += '<div class="lang-switch">'
      + '<button data-lang="zh" class="' + (getLang() === 'zh' ? 'active' : '') + '">中</button>'
      + '<button data-lang="en" class="' + (getLang() === 'en' ? 'active' : '') + '">EN</button>'
      + '</div>';
    right += '<a class="cart-link" href="/cart.html">🛒<span id="cart-badge" class="cart-badge">0</span></a>';
    right += '<a class="btn btn-outline btn-sm" href="/admin.html">' + t('admin') + '</a>';
    if (token) {
      right += '<div class="auth-btns"><button class="btn btn-outline btn-sm" onclick="App.logout()">' + t('logout') + '</button></div>';
    } else {
      right += '<div class="auth-btns"><button class="btn btn-outline btn-sm" onclick="App.openAuth(\'login\')">' + t('login') + '</button>'
        + '<button class="btn btn-primary btn-sm" onclick="App.openAuth(\'register\')">' + t('register') + '</button></div>';
    }
    actions.innerHTML = right;

    // 语言切换事件
    actions.querySelectorAll('[data-lang]').forEach(function (btn) {
      btn.onclick = function () {
        setLang(btn.getAttribute('data-lang'));
        location.reload();
      };
    });

    // 购物车角标
    loadCartBadge();
  }

  function loadCartBadge() {
    var el = document.getElementById('cart-badge');
    if (!el) return;
    if (!getToken()) { el.textContent = '0'; return; }
    api('/api/cart', { token: getToken() })
      .then(function (data) {
        var n = data.items ? data.items.reduce(function (s, i) { return s + i.quantity; }, 0) : 0;
        el.textContent = n;
      })
      .catch(function () { el.textContent = '0'; });
  }

  // ---------- 登录/注册弹窗 ----------
  var _authMode = 'login';

  function buildAuthModal() {
    var exists = document.getElementById('auth-modal');
    if (exists) return;
    var mask = document.createElement('div');
    mask.id = 'auth-modal';
    mask.className = 'modal-mask hidden';
    mask.innerHTML = '<div class="modal">'
      + '<div class="modal-title" id="auth-title">' + t('login') + '</div>'
      + '<div class="form-group" id="auth-name-group"><label>' + t('full_name') + '</label>'
      + '<input type="text" id="auth-fullname" placeholder="' + t('full_name') + '"></div>'
      + '<div class="form-group"><label>' + t('email') + '</label>'
      + '<input type="email" id="auth-email" placeholder="email@example.com"></div>'
      + '<div class="form-group"><label>' + t('password') + '</label>'
      + '<input type="password" id="auth-password" placeholder="********"></div>'
      + '<div class="modal-actions">'
      + '<button class="btn btn-outline" id="auth-switch">' + t('register') + '</button>'
      + '<button class="btn btn-primary" id="auth-submit">' + t('login') + '</button>'
      + '</div></div>';
    document.body.appendChild(mask);
    mask.querySelector('#auth-switch').onclick = function () {
      _authMode = _authMode === 'login' ? 'register' : 'login';
      updateAuthModal();
    };
    mask.querySelector('#auth-submit').onclick = submitAuth;
    mask.onclick = function (e) { if (e.target === mask) closeAuth(); };
  }

  function updateAuthModal() {
    var title = document.getElementById('auth-title');
    var nameGroup = document.getElementById('auth-name-group');
    var submit = document.getElementById('auth-submit');
    var sw = document.getElementById('auth-switch');
    if (_authMode === 'login') {
      title.textContent = t('login'); submit.textContent = t('login');
      sw.textContent = t('no_account') + ' ' + t('register');
      nameGroup.classList.add('hidden');
    } else {
      title.textContent = t('register'); submit.textContent = t('register');
      sw.textContent = t('have_account') + ' ' + t('login');
      nameGroup.classList.remove('hidden');
    }
  }

  function openAuth(mode) {
    buildAuthModal();
    _authMode = mode || 'login';
    updateAuthModal();
    document.getElementById('auth-modal').classList.remove('hidden');
  }

  function closeAuth() {
    var m = document.getElementById('auth-modal');
    if (m) m.classList.add('hidden');
  }

  function submitAuth() {
    var email = document.getElementById('auth-email').value.trim();
    var password = document.getElementById('auth-password').value;
    var fullName = document.getElementById('auth-fullname').value.trim();
    if (!email || !password) { toast(t('email') + ' / ' + t('password'), 'error'); return; }

    if (_authMode === 'login') {
      api('/api/auth/login', { method: 'POST', includeLang: false, body: { email: email, password: password } })
        .then(function (data) {
          setToken(data.access_token);
          closeAuth();
          toast(t('operation_success'), 'success');
          if (document.getElementById('cart-badge')) loadCartBadge();
          renderNav();
        })
        .catch(function (e) { toast(e.message, 'error'); });
    } else {
      api('/api/auth/register', { method: 'POST', includeLang: false, body: { email: email, password: password, full_name: fullName } })
        .then(function (data) {
          setToken(data.access_token);
          closeAuth();
          toast(t('operation_success'), 'success');
          renderNav();
        })
        .catch(function (e) { toast(e.message, 'error'); });
    }
  }

  function logout() {
    clearToken();
    toast(t('operation_success'), 'success');
    renderNav();
  }

  // 暴露全局
  global.App = {
    TRANSLATIONS: TRANSLATIONS,
    getLang: getLang, setLang: setLang, t: t,
    getToken: getToken, setToken: setToken, clearToken: clearToken,
    getAdminToken: getAdminToken, setAdminToken: setAdminToken, clearAdminToken: clearAdminToken,
    api: api, toast: toast, badge: badge, money: money,
    renderNav: renderNav, loadCartBadge: loadCartBadge,
    openAuth: openAuth, closeAuth: closeAuth, logout: logout,
  };
})(window);