/* =========================================================
   PyMall Vue 共享层
   基于 Vue 3 Global Build，提供：
   - 多语言 (composable: useI18n)
   - API 封装
   - 全局导航/登录弹窗/Toast 组件
   ========================================================= */
(function (global) {
  'use strict';

  var Vue = global.Vue;

  // ---------- 翻译表（与后端 i18n.py 一致） ----------
  var TRANSLATIONS = {
    zh: {
      home: '首页', products: '全部商品', cart: '购物车', orders: '我的订单',
      login: '登录', register: '注册', logout: '退出登录', admin: '管理后台',
      search_placeholder: '搜索商品...',
      hot_categories: '热门分类', featured: '推荐商品', all_products: '全部商品',
      all_orders: '全部订单',
      add_to_cart: '加入购物车', buy_now: '立即购买', stock: '库存', sold: '已售',
      quantity: '数量', checkout: '结算', submit_order: '提交订单',
      receiver_name: '收货人', receiver_phone: '联系电话', receiver_address: '收货地址',
      remark: '备注(选填)', payment_method: '支付方式', pay_now: '立即支付',
      order_no: '订单号', order_status: '订单状态', empty_cart: '购物车是空的',
      go_shopping: '去逛逛', language: '语言', email: '邮箱', password: '密码',
      full_name: '姓名', mock_pay: '模拟支付', alipay: '支付宝', wechat: '微信支付', stripe: 'Stripe',
      pending: '待支付', paid: '已支付', shipped: '已发货', completed: '已完成',
      cancelled: '已取消', refunded: '已退款', status: '状态', actions: '操作',
      cancel_order: '取消订单', confirm_receipt: '确认收货', no_orders: '暂无订单',
      subtotal: '商品小计', shipping_fee: '运费', discount: '优惠', total: '合计',
      unit_price: '单价', delete: '删除', not_logged_in: '请先登录',
      no_account: '还没有账号？', have_account: '已有账号？',
      operation_success: '操作成功', operation_failed: '操作失败',
      loading: '加载中...', no_result: '未找到相关商品', clear_search: '清除搜索',
      search_result: '搜索结果', welcome: '欢迎', empty_cart_desc: '去挑选心仪的商品吧',
      receive_info: '收货信息', order_summary: '订单汇总', safe_pay: '安全支付',
      free_ship: '全球免运费', easy_return: '7天无理由退换', support: '在线客服 7×24',
      free_ship_desc: '满额即享免费配送', safe_pay_desc: '多重支付保障',
      easy_return_desc: '无理由退换货', support_desc: '专业客服团队',
      subscribe_title: '订阅优惠信息', subscribe_desc: '第一时间获取新品与折扣',
      subscribe_btn: '订阅', subscribe_ph: '输入您的邮箱', subscribe_ok: '订阅成功！',
      about_us: '关于我们', about_desc: 'PyMall 面向全球的时尚电商平台，提供高品质商品与优质服务。',
      cust_service: '客户服务', ship_info: '配送说明', return_policy: '退换政策',
      privacy: '隐私条款', contact_us: '联系我们', payment_icons: '支付宝 · 微信 · Stripe',
      need_login: '请先登录后再操作', cart_updated: '购物车已更新',
      added_to_cart: '已加入购物车', brand: '品牌', sku: '规格',
      home_new: 'NEW ARRIVALS', home_title: '时尚焕新 点亮每一天',
      home_sub: '精选全球好物，潮流设计，品质之选',
      shop_now: '立即选购', all_categories: '全部',
      order_detail: '订单详情', receiver: '收货人', order_items: '订单商品',
      order_time: '下单时间', pay_time: '支付时间', ship_time: '发货时间',
      shipping_fee_detail: '运费', discount_detail: '优惠', payment_amount: '实付款',
      order_logistics: '物流信息', logistics_pending: '等待发货',
      confirm: '确认', cancel: '取消', back: '返回',
      admin: '管理后台', my_orders: '我的订单',
      // ---- 我的（账户中心） ----
      my_account: '我的', my_account_center: '个人中心', my_profile: '我的资料',
      pending_orders_title: '待支付', paid_orders_title: '已支付订单',
      my_addresses_title: '我的地址', my_reviews_title: '我的评价',
      my_wishlist_title: '我的收藏', my_after_sales: '我的售后',
      edit: '编辑', save: '保存', phone: '手机号', view_all: '查看全部',
      confirm_delete: '确认删除该条记录？',
      approved_review: '已通过', review_pending: '审核中',
      after_sales_empty: '暂无售后记录', after_sales_tip: '如有退换货需求，请联系在线客服',
      // ---- 登录引导 ----
      orders_login_tip: '登录后查看您的订单', cart_login_tip: '登录后查看和管理您的购物车',
      // ---- About Us ----
      about: '关于我们', brand_story: '品牌故事', about_hero_tag: 'ABOUT PyMall',
      about_hero_title: 'PyMall 是全球设计师潮玩电商平台',
      about_hero_sub: '连接艺术家与粉丝，通过角色化潮流玩具与沉浸式体验，传递创意与快乐。',
      our_story: '我们的故事', our_story_kicker: 'OUR STORY',
      our_story_p1: 'PyMall 创立于 2020 年，从一个热爱潮流文化的小团队起步，',
      our_story_p2: '我们相信每个人都有属于自己的潮流表达。',
      mission_title: '我们的使命', mission_kicker: 'MISSION',
      mission_desc: '让每一位用户都能发现独特、有趣的潮流商品，支持艺术家与设计师的创作。',
      mission_p1: '让好设计被看见', mission_p2: '让好作品触达全球',
      discover_title: '探索 PyMall', discover_kicker: 'DISCOVER',
      discover_desc: '从线上商城到社区互动，我们打造完整的潮流体验生态。',
      discover_1_title: 'PyMall 商城', discover_1_desc: '精选全球设计师潮玩，正品保障，全球直邮',
      discover_2_title: '创作者计划', discover_2_desc: '支持独立艺术家与设计师，让灵感成真',
      discover_3_title: '潮流社区', discover_3_desc: '分享收藏心得，结识同好，玩出态度',
      milestones_title: '成长历程', milestones_kicker: 'MILESTONES',
      m1_time: '2020', m1_title: '创立', m1_desc: 'PyMall 正式上线，首批 50 位设计师入驻',
      m2_time: '2022', m2_title: '全球扩展', m2_desc: '服务覆盖 30 个国家与地区',
      m3_time: '2024', m3_title: '百万会员', m3_desc: '会员突破 100 万，社区活跃度领先行业',
      m4_time: '2026', m4_title: '持续创新', m4_desc: '布局 AI 潮流推荐与沉浸式购物体验',
      values_title: '我们的价值观', values_kicker: 'VALUES',
      v1_title: '创意至上', v1_desc: '尊重每一种创意的表达',
      v2_title: '真诚服务', v2_desc: '以用户为中心，真诚而负责',
      v3_title: '全球视野', v3_desc: '连接全球艺术家与潮流爱好者',
      about_footer_desc: 'PyMall 是全球设计师潮流电商平台，连接艺术家与粉丝，传递创意与快乐。',
      // ---- 收藏 ----
      wishlist: '收藏', my_wishlist: '我的收藏', added_to_wishlist: '已加入收藏',
      removed_from_wishlist: '已取消收藏', wishlist_empty: '收藏夹是空的',
      wishlist_empty_desc: '点击商品上的 ★ 收藏心仪好物',
      wishlisted: '已收藏', add_wishlist: '加入收藏', go_shopping: '去逛逛',
      clear_wishlist: '清空收藏',
      // ---- 评价 ----
      reviews: '商品评价', review_count: '条评价', write_review: '写评价',
      review_title: '评价标题', review_content: '评价内容', review_rating: '评分',
      review_submit: '提交评价', review_success: '评价提交成功',
      review_placeholder: '分享您的购物体验...', login_to_review: '登录后发表评价',
      no_reviews: '还没有评价，快来抢沙发~', review_required: '请填写评分和评价内容',
      review_submitted: '评价已提交，审核通过后展示', already_reviewed: '您已评价过该商品',
      // ---- 地址 ----
      my_addresses: '收货地址', add_address: '新增地址', address: '地址',
      addr_name: '收货人', addr_phone: '联系电话', addr_detail: '详细地址',
      addr_default: '默认地址',
      // ---- 高级筛选 ----
      filter: '筛选', min_price: '最低价', max_price: '最高价', sort_by: '排序',
      sort_default: '默认排序', sort_price_asc: '价格从低到高', sort_price_desc: '价格从高到低',
      sort_sales_desc: '销量优先', sort_newest: '新品上架', sort_favorites_desc: '收藏最多', compare: '对比', no_wishlist: '暂无收藏',
      confirm: '确定', reset: '重置',
      // ---- 邮箱验证码 ----
      verify_code: '验证码', verify_code_ph: '6 位数字验证码', send_code: '发送验证码',
      resend_in: '重新发送(', code_sent: '验证码已发送，请查收邮件', required: '不能为空',
      verify_code_required: '请先获取并填写邮箱验证码',
      code_sent_dev: '开发模式验证码',
      // ---- 忘记密码 ----
      forgot_password: '忘记密码？', reset_password: '重置密码', new_password: '新密码',
      new_password_ph: '输入新密码（至少 6 位）', back_to_login: '返回登录',
      reset_password_ok: '密码已重置，请使用新密码登录',
      confirm_password: '确认密码', confirm_password_ph: '再次输入密码',
      password_mismatch: '两次输入的密码不一致',
      invalid_email: '邮箱格式不正确', password_too_short: '密码至少 6 位',
    },
    en: {
      home: 'Home', products: 'Products', cart: 'Cart', orders: 'My Orders',
      login: 'Login', register: 'Register', logout: 'Logout', admin: 'Admin',
      search_placeholder: 'Search products...',
      hot_categories: 'Hot Categories', featured: 'Featured', all_products: 'All Products',
      all_orders: 'All Orders',
      add_to_cart: 'Add to Cart', buy_now: 'Buy Now', stock: 'Stock', sold: 'Sold',
      quantity: 'Qty', checkout: 'Checkout', submit_order: 'Place Order',
      receiver_name: 'Full Name', receiver_phone: 'Phone', receiver_address: 'Address',
      remark: 'Note (Optional)', payment_method: 'Payment', pay_now: 'Pay Now',
      order_no: 'Order No.', order_status: 'Status', empty_cart: 'Your cart is empty',
      go_shopping: 'Go Shopping', language: 'Language', email: 'Email', password: 'Password',
      full_name: 'Name', mock_pay: 'Mock Pay', alipay: 'Alipay', wechat: 'WeChat', stripe: 'Stripe',
      pending: 'Pending', paid: 'Paid', shipped: 'Shipped', completed: 'Completed',
      cancelled: 'Cancelled', refunded: 'Refunded', status: 'Status', actions: 'Actions',
      cancel_order: 'Cancel', confirm_receipt: 'Confirm Receipt', no_orders: 'No orders yet',
      subtotal: 'Subtotal', shipping_fee: 'Shipping', discount: 'Discount', total: 'Total',
      unit_price: 'Unit Price', delete: 'Delete', not_logged_in: 'Please login',
      no_account: 'No account?', have_account: 'Already have an account?',
      operation_success: 'Success', operation_failed: 'Failed',
      loading: 'Loading...', no_result: 'No products found', clear_search: 'Clear Search',
      search_result: 'Search Results', welcome: 'Welcome', empty_cart_desc: 'Find something you love',
      receive_info: 'Shipping Info', order_summary: 'Order Summary', safe_pay: 'Secure Payment',
      free_ship: 'Free Shipping', easy_return: '7-Day Returns', support: '24/7 Support',
      free_ship_desc: 'Free delivery over threshold', safe_pay_desc: 'Multiple payment options',
      easy_return_desc: 'Hassle-free returns', support_desc: 'Professional support team',
      subscribe_title: 'Subscribe & Save', subscribe_desc: 'Get new arrivals and exclusive offers',
      subscribe_btn: 'Subscribe', subscribe_ph: 'Enter your email', subscribe_ok: 'Subscribed!',
      about_us: 'About Us', about_desc: 'PyMall is a global fashion e-commerce platform offering quality products and services.',
      cust_service: 'Customer Service', ship_info: 'Shipping Info', return_policy: 'Return Policy',
      privacy: 'Privacy Policy', contact_us: 'Contact Us', payment_icons: 'Alipay · WeChat · Stripe',
      need_login: 'Please login first', cart_updated: 'Cart updated',
      added_to_cart: 'Added to cart', brand: 'Brand', sku: 'SKU',
      home_new: 'NEW ARRIVALS', home_title: 'Fresh Looks for Every Day',
      home_sub: 'Curated global picks, trendy designs, quality choices',
      shop_now: 'Shop Now', all_categories: 'All',
      order_detail: 'Order Detail', receiver: 'Receiver', order_items: 'Items',
      order_time: 'Order Time', pay_time: 'Paid At', ship_time: 'Shipped At',
      shipping_fee_detail: 'Shipping Fee', discount_detail: 'Discount', payment_amount: 'Paid Amount',
      order_logistics: 'Logistics', logistics_pending: 'Awaiting Shipment',
      confirm: 'Confirm', cancel: 'Cancel', back: 'Back',
      admin: 'Admin', my_orders: 'My Orders',
      // ---- 我的（账户中心） ----
      my_account: 'My Account', my_account_center: 'Account Center', my_profile: 'My Profile',
      pending_orders_title: 'Pending Payment', paid_orders_title: 'Paid Orders',
      my_addresses_title: 'My Addresses', my_reviews_title: 'My Reviews',
      my_wishlist_title: 'My Wishlist', my_after_sales: 'After-sales',
      edit: 'Edit', save: 'Save', phone: 'Phone', view_all: 'View All',
      confirm_delete: 'Confirm delete this record?',
      approved_review: 'Approved', review_pending: 'Pending',
      after_sales_empty: 'No after-sales records', after_sales_tip: 'For returns or exchanges, please contact support',
      // ---- 登录引导 ----
      orders_login_tip: 'Log in to view your orders', cart_login_tip: 'Log in to view and manage your cart',
      // ---- About Us ----
      about: 'About Us', brand_story: 'Brand Story', about_hero_tag: 'ABOUT PyMall',
      about_hero_title: 'PyMall is a global designer toy e-commerce platform',
      about_hero_sub: 'Connecting artists and fans through character-based collectible toys and immersive experiences.',
      our_story: 'Our Story', our_story_kicker: 'OUR STORY',
      our_story_p1: 'Founded in 2020, PyMall started as a small team passionate about street culture.',
      our_story_p2: 'We believe everyone has their own expression of fashion.',
      mission_title: 'Our Mission', mission_kicker: 'MISSION',
      mission_desc: 'Help every user discover unique and fun products, and support artists and designers.',
      mission_p1: 'Make great design visible', mission_p2: 'Bring great works to the world',
      discover_title: 'Discover PyMall', discover_kicker: 'DISCOVER',
      discover_desc: 'From online store to community, we build a complete trend experience ecosystem.',
      discover_1_title: 'PyMall Store', discover_1_desc: 'Curated designer toys worldwide, authentic & global shipping',
      discover_2_title: 'Creator Program', discover_2_desc: 'Support independent artists and designers',
      discover_3_title: 'Community', discover_3_desc: 'Share collections, meet friends, play with attitude',
      milestones_title: 'Milestones', milestones_kicker: 'MILESTONES',
      m1_time: '2020', m1_title: 'Founded', m1_desc: 'PyMall launched with 50 designers on board',
      m2_time: '2022', m2_title: 'Global Expansion', m2_desc: 'Serving customers in 30+ countries',
      m3_time: '2024', m3_title: '1M Members', m3_desc: '1 million members, leading community',
      m4_time: '2026', m4_title: 'Keep Innovating', m4_desc: 'AI-powered recommendations & immersive shopping',
      values_title: 'Our Values', values_kicker: 'VALUES',
      v1_title: 'Creativity First', v1_desc: 'Respect every expression of creativity',
      v2_title: 'Sincere Service', v2_desc: 'User-centric, sincere and responsible',
      v3_title: 'Global Vision', v3_desc: 'Connecting artists and enthusiasts worldwide',
      about_footer_desc: 'PyMall is a global designer toy platform connecting artists and fans.',
      // ---- 收藏 ----
      wishlist: 'Wishlist', my_wishlist: 'My Wishlist', added_to_wishlist: 'Added to wishlist',
      removed_from_wishlist: 'Removed from wishlist', wishlist_empty: 'Your wishlist is empty',
      wishlist_empty_desc: 'Tap the ★ on any product to save it', wishlisted: 'Saved',
      add_wishlist: 'Add to Wishlist', go_shopping: 'Start Shopping',
      clear_wishlist: 'Clear Wishlist',
      // ---- 评价 ----
      reviews: 'Reviews', review_count: 'reviews', write_review: 'Write a Review',
      review_title: 'Review Title', review_content: 'Review Content', review_rating: 'Rating',
      review_submit: 'Submit Review', review_success: 'Review submitted',
      review_placeholder: 'Share your shopping experience...', login_to_review: 'Log in to review',
      no_reviews: 'No reviews yet. Be the first!',
      review_required: 'Please add a rating and some content',
      review_submitted: 'Review submitted, will show after approval', already_reviewed: 'You have already reviewed this product',
      // ---- 地址 ----
      my_addresses: 'Shipping Addresses', add_address: 'Add Address', address: 'Address',
      addr_name: 'Full Name', addr_phone: 'Phone', addr_detail: 'Address Details',
      addr_default: 'Default',
      // ---- 高级筛选 ----
      filter: 'Filter', min_price: 'Min Price', max_price: 'Max Price', sort_by: 'Sort By',
      sort_default: 'Default', sort_price_asc: 'Price: Low to High', sort_price_desc: 'Price: High to Low',
      sort_sales_desc: 'Best Selling', sort_newest: 'New Arrivals', sort_favorites_desc: 'Most Wished', compare: 'Compare', no_wishlist: 'No wishlist items',
      confirm: 'Apply', reset: 'Reset',
      // ---- Email verification code ----
      verify_code: 'Verification Code', verify_code_ph: '6-digit code',
      send_code: 'Send Code', resend_in: 'Resend in (',
      code_sent: 'Verification code sent, please check your email',
      required: 'is required', verify_code_required: 'Please request and enter the verification code',
      code_sent_dev: 'Dev mode code',
      // ---- Forgot password ----
      forgot_password: 'Forgot password?', reset_password: 'Reset Password', new_password: 'New Password',
      new_password_ph: 'Enter new password (min 6 chars)', back_to_login: 'Back to login',
      reset_password_ok: 'Password reset, please login with new password',
      confirm_password: 'Confirm Password', confirm_password_ph: 'Enter password again',
      password_mismatch: 'Passwords do not match',
      invalid_email: 'Invalid email format', password_too_short: 'Password must be at least 6 characters',
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

  // ---------- Token ----------
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

  // ---------- API ----------
  function api(path, options) {
    options = options || {};
    var headers = options.headers || {};
    headers['Content-Type'] = 'application/json';
    if (options.token) {
      headers['Authorization'] = 'Bearer ' + options.token;
    }
    if (options.noLang) {
      // 无 lang 参数
    } else {
      path += (path.indexOf('?') >= 0 ? '&' : '?') + 'lang=' + getLang();
    }
    return fetch(path, {
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

  // ---------- 工具 ----------
  function money(v) {
    var n = Number(v);
    if (isNaN(n)) return '¥0.00';
    return '¥' + n.toFixed(2);
  }

  // ---------- 全局共享 Store ----------
  // 简单的响应式状态（供 Vue 3 reactive 使用）
  var store = Vue.reactive({
    lang: getLang(),
    token: getToken(),
    adminToken: null,
    cartCount: 0,
    wishlistCount: 0,
    authModal: false,
    authMode: 'login', // 'login' | 'register' | 'reset'
    cartItems: [],
  });

  // ---------- I18n Composable ----------
  function t(key) {
    var table = TRANSLATIONS[store.lang] || TRANSLATIONS.zh;
    return table[key] !== undefined ? table[key] : (TRANSLATIONS.zh[key] || key);
  }

  // x 替换占位符：tt('xx {0} {1}', a, b)
  function tt(key) {
    var s = t(key);
    for (var i = 1; i < arguments.length; i++) {
      s = s.replace('{' + (i - 1) + '}', arguments[i]);
    }
    return s;
  }

  function switchLang(lang) {
    setLang(lang);
    store.lang = lang;
  }

  function localName(i18nObj, fallback) {
    if (!i18nObj) return fallback || '';
    return i18nObj[store.lang] || i18nObj.zh || i18nObj.en || fallback || '';
  }

  // ---------- 认证 ----------
  function login(email, password) {
    return api('/api/auth/login', {
      method: 'POST', noLang: true,
      body: { email: email, password: password },
    }).then(function (data) {
      setToken(data.access_token);
      store.token = data.access_token;
      store.authModal = false;
      refreshCart();
      refreshWishlist();
      return data;
    });
  }

  function register(body) {
    if (body && !body.language) body.language = store.lang;
    return api('/api/auth/register', {
      method: 'POST', noLang: true, body: body,
    }).then(function (data) {
      setToken(data.access_token);
      store.token = data.access_token;
      store.authModal = false;
      refreshCart();
      refreshWishlist();
      return data;
    });
  }

  function logout() {
    clearToken();
    store.token = null;
    store.cartCount = 0;
    store.wishlistCount = 0;
    location.href = '/';
  }

  function refreshCart() {
    if (!getToken()) {
      store.cartCount = 0;
      return Promise.resolve(store.cartCount);
    }
    return api('/api/cart', { token: getToken() }).then(function (data) {
      var n = data.items ? data.items.reduce(function (s, i) { return s + i.quantity; }, 0) : 0;
      store.cartCount = n;
      return n;
    }).catch(function () { store.cartCount = 0; return 0; });
  }

  // 刷新收藏数量
  function refreshWishlist() {
    if (!getToken()) {
      store.wishlistCount = 0;
      return Promise.resolve(0);
    }
    return api('/api/wishlist', { token: getToken() }).then(function (data) {
      var items = data.items || data || [];
      store.wishlistCount = Array.isArray(items) ? items.length : 0;
      return store.wishlistCount;
    }).catch(function () { store.wishlistCount = 0; return 0; });
  }

  // 立即购买：商品卡片快捷购买（自动取第一个有货 SKU 加入购物车并跳转结算）
  function buyNow(p) {
    if (!getToken()) {
      openAuth('login');
      return;
    }
    api('/api/products/' + p.id).then(function (detail) {
      var skus = (detail.skus || []).filter(function (s) { return s.is_active && s.available_stock > 0; });
      if (!skus.length) {
        toast(t('sku'), 'error');
        return null;
      }
      return api('/api/cart/items', {
        method: 'POST', token: getToken(),
        body: { sku_id: skus[0].id, quantity: 1 },
      });
    }).then(function (data) {
      if (data) location.href = '/cart.html';
    }).catch(function (e) {
      toast(e.message, 'error');
    });
  }

  // ---------- SVG 图标库（替代 emoji） ----------
  var ICONS = {
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    truck: '<path d="M15 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35a1 1 0 0 0-.78-.38H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    box: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    wallet: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>',
    location: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    review: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    headset: '<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Z"/><path d="M21 11h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-5Z"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/><path d="M3 16v2a4 4 0 0 0 4 4h2"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
    save: '<path d="M15.2 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.8Z"/><path d="M15 3v6h6"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/>',
    pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    card: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    fire: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3 1.072-2.143 2.5-3 4.5-4.5 2 4 1 7.5-1 9a5 5 0 0 1-8-5c-.5 1-1 3 1 6z"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    bulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.23.47 2.34 1.5 3.5.76.76 1.22 1.52 1.41 2.5"/>',
    palette: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
  };

  // 图标组件
  var BaseIcon = {
    props: {
      name: { type: String, required: true },
      size: { type: [Number, String], default: 18 },
      fill: { type: Boolean, default: false },
    },
    template: `<svg :width="size" :height="size" viewBox="0 0 24 24"
      :fill="fill ? 'currentColor' : 'none'"
      :stroke="fill ? 'none' : 'currentColor'"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      style="flex-shrink:0;vertical-align:middle" v-html="path"></svg>`,
    computed: {
      path: function () { return ICONS[this.name] || ''; },
    },
  };

  // ---------- 全局组件 ----------
  // 顶部服务条
  var TopBar = {
    template: `
      <div class="topbar">
        <div class="topbar-inner">
          <span><base-icon name="truck" :size="14"></base-icon> {{ t('free_ship') }} · {{ t('easy_return') }}</span>
        </div>
      </div>`,
    setup() {
      return { t };
    },
  };

  // 主导航
  var MainNav = {
    props: ['active'],
    template: `
      <nav class="main-nav">
        <div class="nav-inner">
          <div class="brand" @click="goHome">
            <span class="brand-name">PyMall</span>
            <span class="brand-tag">FASHION</span>
          </div>
          <div class="nav-search">
            <input :placeholder="t('search_placeholder')" v-model="kw"
                   @keyup.enter="onSearch" @input="onKWChange" @focus="onKWFocus" @blur="onKWBlur" />
            <button class="btn-search" @click="onSearch">{{ t('products') }}</button>
            <div class="ac-panel" v-if="suggestions.length && acOpen">
              <div class="ac-item" v-for="s in suggestions" :key="s.id" @mousedown.prevent="pickSuggestion(s)">
                <img v-if="s.main_image" :src="s.main_image" style="width:34px;height:34px;object-fit:cover;border-radius:6px">
                <div style="flex:1;min-width:0">
                  <div class="ac-name">{{ s.display_name || s.sku_code }}</div>
                </div>
                <span style="color:var(--jjs-primary);font-weight:600;white-space:nowrap">{{ money(s.base_price) }}</span>
              </div>
            </div>
          </div>
          <div class="nav-links">
            <a href="/" class="link" :class="{active: active==='home'}">{{ t('home') }}</a>
            <a href="/products.html" class="link" :class="{active: active==='products'}">{{ t('products') }}</a>
            <a href="/about.html" class="link" :class="{active: active==='about'}">{{ t('about') }}</a>
          </div>
          <div class="nav-actions">
            <div class="lang-switch">
              <button :class="{active: lang==='zh'}" @click="switchLang('zh')">中</button>
              <button :class="{active: lang==='en'}" @click="switchLang('en')">EN</button>
            </div>
            <a href="/cart.html" class="cart-link" title="Cart"><base-icon name="cart" :size="20"></base-icon>
              <span class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</span>
            </a>
            <a href="/account.html" class="account-link" v-if="loggedIn" @click.prevent="goAccount"><base-icon name="user" :size="16"></base-icon> {{ t('my_account') }}</a>
            <button class="btn btn-primary btn-sm" v-else @click="openAuth('login')">{{ t('login') }}</button>
          </div>
        </div>
      </nav>`,
    setup(props) {
      const state = Vue.reactive({
        kw: '',
        suggestions: [],
        acOpen: false,
        acTimer: null,
      });
      Vue.onMounted(() => {
        refreshCart();
        refreshWishlist();
      });
      function goHome() { location.href = '/'; }
      function goOrders() { location.href = '/orders.html'; }
      function goAccount() { location.href = '/account.html'; }
      function onSearch() {
        if (state.kw && state.kw.trim()) {
          location.href = '/products.html?q=' + encodeURIComponent(state.kw.trim());
        }
      }
      function onKWChange() {
        clearTimeout(state.acTimer);
        if (!state.kw || !state.kw.trim()) { state.suggestions = []; return; }
        state.acTimer = setTimeout(() => {
          api('/api/products/autocomplete?q=' + encodeURIComponent(state.kw.trim()) + '&limit=5')
            .then(function (data) {
              var list = Array.isArray(data) ? data : ((data && data.items) || []);
              state.suggestions = list.map(function (s) {
                return {
                  id: s.id,
                  sku_code: s.sku_code,
                  display_name: s.name_zh || s.sku_code,
                  main_image: s.main_image,
                  base_price: s.base_price,
                };
              });
              state.acOpen = state.suggestions.length > 0;
            })
            .catch(function () { state.suggestions = []; });
        }, 300);
      }
      function onKWFocus() {
        if (state.suggestions.length) state.acOpen = true;
      }
      function onKWBlur() {
        setTimeout(function () { state.acOpen = false; }, 150);
      }
      function pickSuggestion(s) {
        clearTimeout(state.acTimer);
        state.acOpen = false;
        location.href = '/products.html?id=' + s.id;
      }
      return {
        t, tt, money,
        lang: Vue.computed(() => store.lang), cartCount: Vue.computed(() => store.cartCount),
        wishlistCount: Vue.computed(() => store.wishlistCount),
        loggedIn: Vue.computed(() => !!store.token),
        suggestions: Vue.computed(() => state.suggestions),
        acOpen: Vue.computed(() => state.acOpen),
        kw: Vue.computed({
          get: () => state.kw,
          set: (v) => { state.kw = v; },
        }),
        switchLang, openAuth, onSearch, onKWChange, onKWFocus, onKWBlur, pickSuggestion, goHome, goOrders, goAccount,
      };
    },
  };

  // 登录/注册弹窗
  var AuthModal = {
    template: `
      <div class="modal-mask" v-if="store.authModal" @click.self="close">
        <div class="modal">
          <button class="modal-close" @click="close">×</button>
          <h3>{{ title }}</h3>
          <div class="form-group">
            <label>{{ t('full_name') }}</label>
            <input type="text" v-model="form.fullName" v-if="store.authMode==='register'"
                   :placeholder="t('full_name')" />
          </div>
          <div class="form-group">
            <label>{{ t('email') }}</label>
            <input type="email" v-model="form.email" placeholder="email@example.com" />
          </div>
          <div class="form-group" v-if="store.authMode==='login'">
            <label>{{ t('password') }}</label>
            <input type="password" v-model="form.password" placeholder="********"
                   @keyup.enter="submit" />
          </div>
          <div class="form-group" v-if="store.authMode==='register'">
            <label>{{ t('password') }}</label>
            <input type="password" v-model="form.password" placeholder="********" />
          </div>
          <div class="form-group" v-if="store.authMode==='register'">
            <label>{{ t('confirm_password') }}</label>
            <input type="password" v-model="form.confirmPassword" :placeholder="t('confirm_password_ph')"
                   @keyup.enter="submit" />
          </div>
          <div class="form-group" v-if="store.authMode==='reset'">
            <label>{{ t('new_password') }}</label>
            <input type="password" v-model="form.newPassword" :placeholder="t('new_password_ph')" />
          </div>
          <div class="form-group" v-if="store.authMode==='reset'">
            <label>{{ t('confirm_password') }}</label>
            <input type="password" v-model="form.confirmPassword" :placeholder="t('confirm_password_ph')"
                   @keyup.enter="submit" />
          </div>
          <div class="form-group" v-if="store.authMode==='register' || store.authMode==='reset'">
            <label>{{ t('verify_code') }}</label>
            <div style="display:flex;gap:8px">
              <input type="text" v-model="form.code" :placeholder="t('verify_code_ph')"
                     style="flex:1" @keyup.enter="submit" />
              <button class="btn btn-outline btn-sm" type="button" @click="sendCode"
                      :disabled="cooldown > 0" style="white-space:nowrap">
                {{ cooldown > 0 ? t('resend_in') + cooldown + 's)' : t('send_code') }}
              </button>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary btn-block" @click="submit">
              {{ submitLabel }}
            </button>
          </div>
          <div class="modal-switch">
            <span v-if="store.authMode==='login'">
              <a @click="store.authMode='reset'">{{ t('forgot_password') }}</a>
              <span style="margin:0 6px">|</span>{{ t('no_account') }}
              <a @click="store.authMode='register'">{{ t('register') }}</a>
            </span>
            <span v-else-if="store.authMode==='register'">{{ t('have_account') }}
              <a @click="store.authMode='login'">{{ t('login') }}</a>
            </span>
            <span v-else>
              <a @click="store.authMode='login'">{{ t('back_to_login') }}</a>
            </span>
          </div>
        </div>
      </div>`,
    setup() {
      const form = Vue.reactive({ email: '', password: '', fullName: '', code: '', newPassword: '', confirmPassword: '' });
      const cooldown = Vue.ref(0);
      let timer = null;

      // 模式切换时清空相关字段
      function watchMode(mode) {
        form.code = '';
        form.confirmPassword = '';
        if (mode !== 'reset') form.newPassword = '';
      }
      Vue.watch(() => store.authMode, (m) => watchMode(m));

      const title = Vue.computed(function () {
        if (store.authMode === 'register') return t('register');
        if (store.authMode === 'reset') return t('reset_password');
        return t('login');
      });
      const submitLabel = Vue.computed(function () {
        if (store.authMode === 'register') return t('register');
        if (store.authMode === 'reset') return t('reset_password');
        return t('login');
      });

      function close() { store.authModal = false; }

      // 发送验证码前校验：邮箱 + 密码（两次一致）
      function validateBeforeSendCode() {
        if (!form.email) { toast(t('email') + ' ' + t('required'), 'error'); return false; }
        var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(form.email)) { toast(t('invalid_email'), 'error'); return false; }
        if (store.authMode === 'register') {
          if (!form.password) { toast(t('password') + ' ' + t('required'), 'error'); return false; }
          if (form.password.length < 6) { toast(t('password_too_short'), 'error'); return false; }
          if (form.password !== form.confirmPassword) { toast(t('password_mismatch'), 'error'); return false; }
        } else if (store.authMode === 'reset') {
          if (!form.newPassword || form.newPassword.length < 6) { toast(t('new_password_ph'), 'error'); return false; }
          if (form.newPassword !== form.confirmPassword) { toast(t('password_mismatch'), 'error'); return false; }
        }
        return true;
      }

      function sendCode() {
        if (cooldown.value > 0) return;
        // 邮箱/密码全部校验通过后才发送验证码
        if (!validateBeforeSendCode()) return;
        cooldown.value = 60;
        if (timer) clearInterval(timer);
        timer = setInterval(function () {
          cooldown.value--;
          if (cooldown.value <= 0) clearInterval(timer);
        }, 1000);
        var purpose = store.authMode === 'reset' ? 'reset' : 'register';
        api('/api/auth/send-code', {
          method: 'POST', noLang: true,
          body: { email: form.email, purpose: purpose },
        }).then(function (data) {
          if (data && data.debug_code) {
            form.code = data.debug_code;
            toast(t('code_sent_dev') + '：' + data.debug_code, 'success');
          } else {
            toast(t('code_sent'), 'success');
          }
        }).catch(function (e) {
          cooldown.value = 0;
          toast(e.message, 'error');
        });
      }

      function submit() {
        if (!form.email) { toast(t('email') + ' ' + t('required'), 'error'); return; }
        if (store.authMode === 'login') {
          if (!form.password) { toast(t('password') + ' ' + t('required'), 'error'); return; }
          login(form.email, form.password)
            .then(function () { toast(t('operation_success'), 'success'); })
            .catch(function (e) { toast(e.message, 'error'); });
        } else if (store.authMode === 'register') {
          if (!form.password) { toast(t('password') + ' ' + t('required'), 'error'); return; }
          if (form.password !== form.confirmPassword) { toast(t('password_mismatch'), 'error'); return; }
          if (!form.code) { toast(t('verify_code_required'), 'error'); return; }
          register({ email: form.email, password: form.password, full_name: form.fullName, code: form.code })
            .then(function () { toast(t('operation_success'), 'success'); })
            .catch(function (e) { toast(e.message, 'error'); });
        } else { // reset
          if (!form.newPassword || form.newPassword.length < 6) { toast(t('new_password_ph'), 'error'); return; }
          if (form.newPassword !== form.confirmPassword) { toast(t('password_mismatch'), 'error'); return; }
          if (!form.code) { toast(t('verify_code_required'), 'error'); return; }
          api('/api/auth/reset-password', {
            method: 'POST', noLang: true,
            body: { email: form.email, code: form.code, new_password: form.newPassword },
          }).then(function (data) {
            toast(data.message || t('reset_password_ok'), 'success');
            store.authMode = 'login';
            form.password = '';
            form.newPassword = '';
            form.confirmPassword = '';
            form.code = '';
          }).catch(function (e) { toast(e.message, 'error'); });
        }
      }
      return { store, t, form, cooldown, title, submitLabel, close, submit, sendCode };
    },
  };

  // Toast
  function toast(msg, type) {
    var el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2500);
  }

  function openAuth(mode) {
    store.authMode = mode || 'login';
    store.authModal = true;
  }

  // ---------- 页脚公共组件 ----------
  var SiteFooter = {
    template: `
      <footer class="footer">
        <div class="newsletter">
          <div class="newsletter-inner">
            <h3><base-icon name="mail" :size="20"></base-icon> {{ t('subscribe_title') }}</h3>
            <p>{{ t('subscribe_desc') }}</p>
            <div class="newsletter-form">
              <input :placeholder="t('subscribe_ph')" v-model="email" @keyup.enter="sub" />
              <button @click="sub">{{ t('subscribe_btn') }}</button>
            </div>
          </div>
        </div>
        <div class="footer-inner">
          <div class="footer-col">
            <h4>{{ t('about_us') }}</h4>
            <p>{{ t('about_desc') }}</p>
            <a href="/about.html" class="footer-link">{{ t('brand_story') }} <base-icon name="chevronRight" :size="14"></base-icon></a>
          </div>
          <div class="footer-col">
            <h4>{{ t('cust_service') }}</h4>
            <ul>
              <li>{{ t('ship_info') }}</li>
              <li>{{ t('return_policy') }}</li>
              <li>{{ t('privacy') }}</li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>{{ t('contact_us') }}</h4>
            <ul>
              <li><base-icon name="mail" :size="13"></base-icon> support@pymall.com</li>
              <li><base-icon name="phone" :size="13"></base-icon> 400-888-8888</li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>{{ t('payment_method') }}</h4>
            <ul><li>{{ t('payment_icons') }}</li></ul>
          </div>
        </div>
        <div class="copyright">© 2026 PyMall. All rights reserved.</div>
      </footer>`,
    setup() {
      const state = Vue.reactive({ email: '' });
      function sub() {
        if (!state.email) { toast(t('subscribe_ph'), 'error'); return; }
        var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(state.email)) { toast(t('invalid_email'), 'error'); return; }
        api('/api/subscribe', { method: 'POST', noLang: true, body: { email: state.email } })
          .then(function (d) {
            toast(d.message || t('subscribe_ok'), 'success');
            state.email = '';
          })
          .catch(function (e) { toast(e.message, 'error'); });
      }
      return { t, email: Vue.computed(() => state.email), sub };
    },
  };

  // ---------- 导出 ----------
  global.PyMall = {
    Vue: Vue,
    store: store,
    TRANSLATIONS: TRANSLATIONS,
    getLang: getLang,
    setLang: setLang,
    switchLang: switchLang,
    t: t,
    tt: tt,
    localName: localName,
    api: api,
    money: money,
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    login: login,
    register: register,
    logout: logout,
    refreshCart: refreshCart,
    refreshWishlist: refreshWishlist,
    buyNow: buyNow,
    toast: toast,
    openAuth: openAuth,
    icons: ICONS,
    components: {
      BaseIcon: BaseIcon,
      TopBar: TopBar,
      MainNav: MainNav,
      AuthModal: AuthModal,
      SiteFooter: SiteFooter,
    },
  };

  // 页面入口统一挂载
  global.mountPyMall = function (options) {
    var app = Vue.createApp(options);
    app.component('base-icon', BaseIcon);
    app.component('top-bar', TopBar);
    app.component('main-nav', MainNav);
    app.component('auth-modal', AuthModal);
    app.component('site-footer', SiteFooter);
    // 全局注入
    app.config.globalProperties.$t = t;
    app.config.globalProperties.$tt = tt;
    app.config.globalProperties.$money = money;
    app.mount('#app');
  };

})(window);