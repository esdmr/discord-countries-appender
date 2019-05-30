'use strict';

class Intrupt {
  /**
   * @param {string} code 
   */
  constructor (code = '') {
    this.code = code.toUpperCase();
  }
}

exports.Intrupt = Intrupt;
