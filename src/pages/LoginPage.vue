<template>
  <div class="login-container">
    <div class="login-bg full-size"></div>
    <VForm v-slot="{ handleSubmit }" as="form" class="login-content">
      <svg id="appLogo" class="svg-icon logo appLogoColors">
        <use href="/src/assets/images/logo-shellsquare.svg#shellsquare"></use>
      </svg>
      <span class="title-text fontSize-18 fontBold">Drill view</span>
      <div>
        <Field
          v-slot="{ field, errors, errorMessage, handleChange, meta }"
          v-model="email"
          as="div"
          name="Email"
          rules="required|email"
          class="field-container fontSize-10">
          <span class="fontMedium">Email</span>
          <input
            type="text"
            class="form-text fontSize-12"
            maxlength="60"
            autocomplete="off"
            v-bind="field"
            :aria-invalid="!meta.valid && meta.touched"
            @keydown.enter="handleSubmit(loginHandler)"
            @input="handleChange" />
          <span v-if="errors[0] && meta.touched" class="invalid-msg fontSize-10 second-grid">{{ errorMessage }}</span>
        </Field>
        <Field
          v-slot="{ field, errors, errorMessage, handleChange, meta }"
          v-model="authPassword"
          as="div"
          name="Password"
          rules="required"
          class="field-container fontSize-10">
          <span class="fontMedium">Password</span>
          <input
            v-model="authPassword"
            :type="`${passwordReveal ? 'text' : 'password'}`"
            class="form-text fontSize-12"
            autocomplete="new-password"
            v-bind="field"
            :aria-invalid="!meta.valid && meta.touched"
            @keydown.enter="handleSubmit(loginHandler)"
            @input="handleChange" />
          <SvgIcon
            :name="`${passwordReveal ? 'openEye' : 'closeEye'}`"
            class="svg-icon size14 passwordVisible"
            @click="passwordReveal = !passwordReveal" />
          <span v-if="errors[0] && meta.touched" class="invalid-msg fontSize-10 second-grid">{{ errorMessage }}</span>
        </Field>
      </div>
      <CustomButton class="login-button align-self-end fontMedium" @click="handleSubmit(loginHandler)">Login</CustomButton>
      <div class="d-inline-flex justify-content-center gap60">
        <span :class="['loginMode p-relative', { active: activeLoginMode === LoginMode.BASIC }]">
          <SvgIcon name="login-basic" class="svg-icon size40" @click.stop="activeLoginMode = LoginMode.BASIC" />
        </span>
        <span :class="['loginMode p-relative', { active: activeLoginMode === LoginMode.AD }]">
          <SvgIcon name="login-ad" class="svg-icon size40" @click.stop="activeLoginMode = LoginMode.AD" />
        </span>
      </div>
    </VForm>
    <nav class="navigation fontSize-14 cursor-pointer">
      <span
        v-for="(link, i) in navLinks"
        :key="i"
        :class="{ 'active fontSize-16 fontBold': store.landingPage === link }"
        @click="store.landingPage = link">
        {{ link }}
      </span>
    </nav>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { store } from '../main';
  import { saveToWebStorage } from '../common/utils';
  import { Api } from '../services/api.services';
  import { LoginResponse } from '../../server/interfaces/auth.interfaces';
  import Logger from '../common/logger';
  import { WebStorageKeys } from '@/interfaces/common.interfaces';
  import { Form as VForm, Field } from 'vee-validate';
  import { routes } from '@/router';

  export enum LoginMode {
    BASIC = 'Basic',
    AD = 'AD',
  }

  export default defineComponent({
    name: 'LoginPage',
    components: { VForm, Field },
    data() {
      return {
        store: store,
        LoginMode: LoginMode,
        email: '' as string,
        authPassword: '' as string,
        passwordReveal: false,
        activeLoginMode: LoginMode.BASIC as LoginMode,
      };
    },
    computed: {
      navLinks() {
        return routes.filter((r) => r?.meta?.showInLoginNav).map((r) => r.name);
      },
    },
    methods: {
      async loginHandler() {
        if (this.email && this.authPassword) {
          const result = (await Api.auth(this.email, this.authPassword)) as LoginResponse;
          if (result && result.access_token) {
            store.authInfo = result;
            Logger.Verbose('User Successfully Logged In', { email: this.email });
            saveToWebStorage(WebStorageKeys.AUTH, result);
          }
        }
      },
    },
  });
</script>

<style scoped>
  .appLogoColors {
    --logo_color_shell: #000;
    --logo_color_square: #55b848;
    --logo_color_top_icon: #fff;
    --logo_color_bottom_icon: #55b848;
    --logo_color_icon_border: #a3a2a2;
  }

  .login-container {
    color: #000 !important;
    display: flex;
    justify-content: end;
    height: 100%;
    padding: 25px 50px 20px;
    flex-direction: column;
  }

  .login-bg {
    background: url(/src/assets/images/login-bg.webp);
    background-size: cover;
    position: absolute;
    left: 0;
    top: 0;
    transform: scaleX(-1);
  }

  .login-content {
    min-width: 425px;
    padding: 40px 50px;
    border-radius: 10px;
    background: #f7f7f7;
    display: flex;
    flex-direction: column;
    box-shadow: 0px 6px 12px 5px rgb(0 0 0 / 20%);
    user-select: none;
    transform: translate(-75%, -50%);
    z-index: 1;
    position: absolute;
    left: 75%;
    top: 45%;
  }

  .login-button {
    width: 55% !important;
    letter-spacing: 1.5px;
    align-items: center;
    height: 45px;
    margin-bottom: 90px;
    margin-top: 5px;
  }

  .title-text {
    text-align: center;
    text-transform: uppercase;
    margin-bottom: 25px;
  }

  .field-container {
    display: grid;
    position: relative;
    align-items: end;
    text-align: end;
    justify-content: space-between;
    gap: 10px;
    grid-template-columns: 1fr 6fr;
    padding-bottom: 25px;
  }

  .form-text {
    color-scheme: none !important;
    border-radius: 0;
    outline: none;
    width: 100%;
    border: 0;
    border-bottom: 1px solid #000;
    background: none;
    padding: 0;
    padding-bottom: 2px;
    box-shadow:
      inset 0 0 0 1px rgba(247, 247, 247, 0),
      inset 0 0 0 100px rgb(247, 247, 247);
  }

  .logo {
    width: 100%;
    height: 50px;
    margin-bottom: 50px;
    margin-top: 15px;
  }
  .passwordVisible {
    position: absolute;
    right: 0.5em;
    top: 0;
    color: #777;
  }

  .second-grid {
    grid-column: 2;
  }

  .invalid-msg {
    top: 1.8em;
  }

  .navigation {
    background: #ffffff94;
    border-radius: 10px;
    display: inline-flex;
    overflow-y: auto;
    user-select: none;
    z-index: 1;
    padding: 15px 50px;
    gap: 100px;
    white-space: nowrap;
  }

  .navigation > span.active {
    border-bottom: 4px solid var(--border-quinary);
  }

  .loginMode.active::after {
    content: '';
    border-bottom: 5px solid var(--border-quinary);
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
  }

  .loginMode svg {
    color: unset;
  }

  [data-theme='dark'] input[type='text'],
  input[type='password'] {
    color: var(--text-static-primary);
  }
</style>
