<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <router-view/>
      <!-- 全局商户切换器 -->
      <MerchantSwitcher />
    </div>
  </a-config-provider>
</template>

<script>
import { domTitle, setDocumentTitle } from '@/utils/domUtil'
import MerchantSwitcher from '@/components/MerchantSwitcher'
import { i18nRender } from '@/locales'

export default {
  components: {
    MerchantSwitcher
  },
  data () {
    return {
    }
  },
  computed: {
    locale () {
      // 只是为了切换语言时，更新标题
      const { title } = this.$route.meta
      title && (setDocumentTitle(`${i18nRender(title)} - ${domTitle}`))

      return this.$i18n.getLocaleMessage(this.$store.getters.lang).antLocale
    }
  }
}
</script>
