<template lang="pug">
  .auth-form.flex-column
    h6.mr-auto name
    b-input(v-model="name")
    h6.mt-2.mr-auto pass
    b-input(v-model="pass")
    b-button.mt-4(:disabled="isDisabledLogin" :variant="isDisabledLogin ? '' : 'outline-primary'" @click="login") Login

</template>

<script>
export default {
  name: 'AuthPage',
  data: () => ({
    name: '',
    pass: ''
  }),
  computed: {
    isDisabledLogin () {
      return !this.name || !this.pass
    },
    loginData () {
      return {
        name: this.name,
        pass: this.pass
      }
    }
  },
  methods: {
    async login () {
      console.log(this.loginData)
    }
  }
}
</script>

<style lang="sass">
.auth-form
  display: flex
  justify-content: center
  align-items: center
  width: 100vw
  height: 100vh
  padding: 0 45%
</style>
