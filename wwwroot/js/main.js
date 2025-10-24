var $;

document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.jQuery === 'undefined') {
        console.error('jQuery is not loaded.');
        return;
    }
    $ = window.jQuery;
    initGoogleLogin();
    var user = getUserInfo();
    if (isValidUser(user)) {
        initKonfirm(user.id);
        initInvoiceModal(user.id,"Invoice Perbaikan");
    }
});
