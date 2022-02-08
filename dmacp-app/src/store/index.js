import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
import loadData from './loadData.js';
import loadFromApi from './loadFromApi.js';

Vue.use(Vuex)


export default new Vuex.Store({
  state: {
    data: [],
    status: "Waiting",
    compress: false,
    events: true,
    relations: 'links',
    selectedMarker: {id: null, type: null, targets: []}
  },
  mutations: {
    MUTATE_DATA(state, { status, parsedData}) {
      if (status == "Loaded") {
        state.data = parsedData
        state.status = status
      }
    },
    MUTATE_VIS_PROPERTY (state, label) {
      if (label === 'Links' || label === 'Signature') {
        state.relations = state.relations === 'signature' ? 'links' : 'signature'
      } else {
        state[label] = !state[label]
        if (label === 'compress') {
          state.relations = 'links'
        }
      }
    },
    MUTATE_SELECTED_MARKER(state, marker) {
      state.selectedMarker.id = marker.id
      state.selectedMarker.type = marker.type
      state.selectedMarker.targets = marker.targets === undefined ? [] : marker.targets
    }
  },
  actions: {
    loadingData ({commit}) {

      const essayUrl = 'https://content-dev.anthropocene-curriculum.org/wp-json/wp/v2/contribution?slug=combustion-products-as-markers-for-the-anthropocene'
      const paintboxUrl = './data/sample-data.json'

      const promise1 = axios.get(essayUrl).catch(function (error) {
        console.log('Error', error.message)
        if (!error.response) { }
        loadData('./data/combustion.html')
          .then((parsedData) => {
            const status = "Loaded"
            console.log('loading from local', parsedData)
            commit('MUTATE_DATA', { status, parsedData })
          })
      })

      const promise2 = axios.get(paintboxUrl)

      Promise.all([promise1, promise2]).then((responses) => {
        console.log(responses)
          let essay = responses[0]
          let paintbox = responses [1]
          let parsedData = []
          const status = "Loaded"
          loadFromApi(essay.data[0], paintbox.data)
            .then(value => {
              parsedData = value
              commit('MUTATE_DATA', { status, parsedData }) 
            });
        })
    },
    changeVisStatus ({commit, dispatch}, label) {
      // Re-running action that loads data.
      dispatch('loadingData')
      commit('MUTATE_VIS_PROPERTY', label)
    },
    changeSelectedMarker({commit}, marker) {
      commit('MUTATE_SELECTED_MARKER', marker)
    }
  },
  modules: {
  }
})
