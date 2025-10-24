// f_user.js
const f_user = (() => {
    // Ambil data user dari localStorage via AppUtils.Storage
    function getUserInfo() {
        const data = {
            id: global.Storage.get('userId') || '',
            username: global.Storage.get('username') || '',
            nama_lengkap: global.Storage.get('nama_lengkap') || '',
            email: global.Storage.get('email') || '',
            no_hp: global.Storage.get('no_hp') || '',
            photo:
                global.Storage.get('photo') || '/assets/img/default-avatar.png'
        };
        return data;
    }

    // Cek apakah user sudah login
    function isLoggedIn() {
        return !!global.Storage.get('userId');
    }

    // Hapus data user dari localStorage (logout)
    function clearUserData() {
        [
            'userId',
            'username',
            'nama_lengkap',
            'email',
            'no_hp',
            'photo'
        ].forEach((k) => {
            global.Storage.remove(k);
        });
    }

    function isValidUser(u) {
        return (
            u != null &&
            typeof u === 'object' &&
            u.id != null &&
            typeof u.username === 'string' &&
            u.username.trim() !== ''
        );
    }

    function getCleanToken() {
        let token = localStorage.getItem('jwt');
        if (!token) return null;

        // hapus tanda kutip di depan & belakang kalau ada
        if (token.startsWith('"') && token.endsWith('"')) {
            token = token.substring(1, token.length - 1);
        }

        return token;
    }

    // Public API
    return {
        getUserInfo,
        isLoggedIn,
        clearUserData,
        isValidUser,
        getCleanToken
    };
})();

window.f_user = f_user;
