/* eslint-disable import/no-unresolved */
import API from 'src/util/api';
import UI from 'src/util/ui';

export class couchHandler {
  constructor(sample, roc, options = {}) {
    let {
      couchDB = {
        url: 'https://gat.mylims.org/roc',
        database: 'eln',
        kind: 'sample',
      },
      reference = undefined,
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
      data = data.filter(
        (item) => item.value.reference.split(' ')[0] === targetReference,
      );
      API.createData(varName, data);
    });
  }

  loadSampleFeatures(viewKind, options) {
    const { showNotification = true } = options;
    const content = this.sample.sample.$content;
    const sampleKind = this.getParentKind();
    const sampleIdentifier =
      sampleKind === viewKind
        ? content.general.metadata.sampleIdentifier
        : 'This field must be replace it';
    API.createData('content', content);
    API.createData('sampleIdentifier', sampleIdentifier);
    if (showNotification) {
      UI.showNotification('Updated current sample', 'success');
    }
  }

  async createSample(entrysample, kind, sampleBatch, sampleReference) {
    const roc = this.roc;
    UI.confirm(`<div> Are you sure to save: ${sampleBatch}? </div>`).then(
      function (result) {
        if (!result) return;
        entrysample.$id = [sampleReference, sampleBatch];
        entrysample.$content.general.kind = kind;
        if (result.sample) entrysample.$id.push(result.sample);
        let userInfo = API.cache('userInfo');
        if (userInfo) {
          entrysample.$owners = [userInfo.email];
        }
        roc.create(entrysample);
        API.doAction('updateSamples');
      },
    );
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
      $creationDate: '',
    };
    result.$content = this.sample.sample.$content;
    result.$content.image = [];
    result.$content.spectra = {};
    result.$content.general.metadata.parent = this.getParent();
    result.$content.general.metadata.sampleIdentifier = API.getData(
      'sampleIdentifier',
    ).resurrect();
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
      uuid: sample._id,
    };
  }

  builtSampleBatch() {
    const sampleIdentifier = API.getData('sampleIdentifier').resurrect();
    return `${sampleIdentifier}`;
  }
}
