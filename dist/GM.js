/**
 * GM - helper
 * @version v0.0.0
 * @link https://github.com/darmn-js/GM#readme
 * @license MIT
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('src/util/api'), require('src/util/ui')) :
  typeof define === 'function' && define.amd ? define(['exports', 'src/util/api', 'src/util/ui'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.GM = {}, global.API, global.UI));
}(this, (function (exports, API, UI) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var API__default = /*#__PURE__*/_interopDefaultLegacy(API);
  var UI__default = /*#__PURE__*/_interopDefaultLegacy(UI);

  /* eslint-disable import/no-unresolved */
  class couchHandler {
    constructor(sample, roc, options = {}) {
      let {
        couchDB = {
          url: 'https://gat.mylims.org/roc',
          database: 'eln',
          kind: 'sample'
        },
        reference = undefined
      } = options;
      this.reference = reference;
      this.targetReference = reference.split(' ')[0];
      this.couchDB = couchDB;
      this.roc = roc;
      this.sample = sample;
    }

    updateSample(sample) {
      this.sample = sample;
    }

    getToc(toc, varName) {
      const targetReference = this.targetReference;
      this.roc.query(toc).then(function (data) {
        data = data.filter(item => item.value.reference.split(' ')[0] === targetReference);
        API__default['default'].createData(varName, data);
      });
    }

    loadSampleFeatures(viewKind, options) {
      const {
        showNotification = true
      } = options;
      const content = this.sample.sample.$content;
      const sampleKind = this.getParentKind();
      const sampleIdentifier = sampleKind === viewKind ? content.general.metadata.sampleIdentifier : 'This field must be replace it';
      API__default['default'].createData('content', content);
      API__default['default'].createData('sampleIdentifier', sampleIdentifier);

      if (showNotification) {
        UI__default['default'].showNotification('Updated current sample', 'success');
      }
    }

    async createSample(entrysample, kind, sampleBatch, sampleReference) {
      const roc = this.roc;
      UI__default['default'].confirm(`<div> Are you sure to save: ${sampleBatch}? </div>`).then(function (result) {
        if (!result) return;
        entrysample.$id = [sampleReference, sampleBatch];
        entrysample.$content.general.kind = kind;
        if (result.sample) entrysample.$id.push(result.sample);
        let userInfo = API__default['default'].cache('userInfo');

        if (userInfo) {
          entrysample.$owners = [userInfo.email];
        }

        roc.create(entrysample);
        API__default['default'].doAction('updateSamples');
      });
    }

    getJSONTemplate() {
      const result = {
        $type: 'entry',
        $id: ['reference', 'batchID'],
        $kind: 'sample',
        $owners: ['admin@cheminfo.org'],
        $content: '',
        $lastModification: 'admin@cheminfo.org',
        $modificationDate: '',
        $creationDate: ''
      };
      result.$content = this.sample.sample.$content;
      result.$content.image = [];
      result.$content.spectra = {};
      result.$content.general.metadata.parent = this.getParent();
      result.$content.general.metadata.sampleIdentifier = API__default['default'].getData('sampleIdentifier').resurrect();
      return result;
    }

    getParentKind() {
      return this.sample.sample.$content.general.kind;
    }

    getParent() {
      const sample = this.sample.sample;
      return {
        reference: sample.$id[0],
        batch: sample.$id[1],
        uuid: sample._id
      };
    }

    builtSampleBatch() {
      const sampleIdentifier = API__default['default'].getData('sampleIdentifier').resurrect();
      return `${sampleIdentifier}`;
    }

  }

  exports.couchHandler = couchHandler;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=GM.js.map
