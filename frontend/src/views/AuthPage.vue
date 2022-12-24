<template lang="pug">
  .auth-form.flex-column
    h3 {{ error }}
    h6.mr-auto name
    b-input(v-model="name" autocomplete="off")
    h6.mt-2.mr-auto pass
    b-input(v-model="pass" autocomplete="off")
    b-button.mt-4(:disabled="isDisabledLogin" :variant="isDisabledLogin ? '' : 'outline-primary'" @click="login") Login

</template>

<script>
import axios from 'axios'

export default {
  name: 'AuthPage',
  data: () => ({
    name: '',
    pass: '',
    error: ''
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
      try {
        const { data } = await axios.post('http://localhost:3002/login', this.loginData)
        const token = data.accessToken
        window.localStorage.setItem('accessToken', JSON.stringify(token))
        axios.defaults.headers['Authorization'] = 'Bearer ' + token
        await this.$router.push('/dashboard')
      } catch (e) {
        this.error = 'пошёл нахуй'
      }
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
