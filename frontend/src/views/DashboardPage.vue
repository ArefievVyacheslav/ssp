<template lang="pug">
  div
    b-icon.logout(icon="power" aria-hidden="true" font-scale="3rem" @click="logout")
    b-jumbotron.parser-card(v-for="shop in data" :key="shop.name" :header="shop.name")
      h3(v-if="shop.start" v-text="shop.start")
      h4(v-if="shop.links" v-text="shop.links")
      h5(v-if="shop.products" v-text="shop.products")
      p(v-if="shop.total" v-text="shop.total")

      b-button.d-inline-flex.pt-2.pr-3.pl-2.pb-2(v-if="shop.total" variant="primary")
        b-icon(icon="arrow-clockwise" animation="spin" font-scale="1")
        .ml-2 Перезапуск

</template>

<script>
export default {
  name: 'DashboardPage',
  data: () => ({
    data: null
  }),
  methods: {
    logout () {
      window.localStorage.setItem('accessToken', null)
      this.$router.push('/login')
    },
    async parsingProductsStoresData () {
      this.data = [
        {
          name: 'Brandshop',
          start: 'Начало сбора в 1:25:03',
          links: 'Ссылки на товары собраны в 1:25:18 за 15 сек.',
          products: 'Информация по товарам собрана в 1:28:42 за 3 мин. 34 сек.',
          total: '3054 прод. было собрано за 5 мин. 32 сек.'
        },
        {
          name: 'Stockmann',
          start: 'Начало сбора в 1:25:03'
        },
        {
          name: 'Lgcity',
          start: 'Начало сбора в 1:25:03'
        }
      ]
    }
  },
  async mounted () {
    await this.parsingProductsStoresData()
  }
}
</script>

<style lang="sass">
.parser-card
  max-width: 80%
  margin: 40px auto
  padding: 2rem !important
  border-radius: 18px

.logout
  position: absolute
  top: 15px
  right: 15px
  cursor: pointer

</style>
