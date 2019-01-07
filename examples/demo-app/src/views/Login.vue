/*
 * Project specific login form
 *
 * #acfx interface: vm.$root.$emit('login', path) on login success
 */

<style lang="scss">
@import '@/assets/css/_settings.colors.scss';
@import '@/assets/css/_settings.metrics.scss';

.c-login {
  &__wrapper {
    position: relative;
    background: $color-dark-1;
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &__box {
    background: $color-light-3;
    width: 400px;
    height: 240px;
  }
  &__form {
    height: 100%;
    padding: $unit-padding-2 0;
  }
}
</style>

<template>
  <div class="c-login__wrapper">
    <div class="c-login__box">
      <form class="c-login__form">
        <div class="o-form-item is-required">
          <label class="o-form-item__label" for="input-username">User</label>
          <input id="input-username" type="text" autocomplete="username" :value="username" />
        </div>
        <div class="o-form-item is-required">
          <label class="o-form-item__label" for="input-password">Password</label>
          <input id="input-password" type="password" autocomplete="current-password" :value="password" />
        </div>
        <div class="o-form-item">
          <label />
          <a class="o-btn o-btn--primary" @click="onLoginClick">Login</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      username: 'abc',
      password: '123',
    };
  },
  methods: {
    onLoginClick() {
      const arg = {
        username: this.username,
        password: this.password,
      };
      const vm = this;
      this.$ac
        .submitLogin(arg)
        .then(() => {
          vm.$ac.loginDirect(vm.$route.query.from);
        })
        .catch((error) => {
          vm.$ac.msg.warning('Login failed. (' + error + ')');
        });
    },
  },
};
</script>
