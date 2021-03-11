<template>
  <b-link v-if="link.href" :href="link.href" :class="textClasses">
    {{ text }}
  </b-link>
  <b-link v-else-if="link.to" :to="link.to" :class="textClasses">
    {{ text }}
  </b-link>
  <span v-else :class="textClasses">
    {{ text }}
  </span>
</template>
<script>
import _ from 'lodash';

export default {
  name: 'TextDisplay',
  props: {
    text: {
      type: String,
      required: true
    },
    textClasses: {
      type: String,
      required: false,
      default: ''
    },
    // Set `link` to turn the displayed text into a link. Pass in an object with either { "href": "..." } specifying
    // the "href" attribute for a normal <a> tag or { "to": ... } specifying a vue-router target route "to" attribute
    // for the <router-link> tag.
    link: {
      type: Object,
      required: false,
      default: () => {
        return {};
      },
      validator: value => {
        let hasHref = 'href' in value;
        let hasTo = 'to' in value;
        if (hasHref && hasTo) return false;
        if (_.isEmpty(value)) return true;
        return hasHref || hasTo;
      }
    }
  }
};
</script>
