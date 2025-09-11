const SubPage = require('../models/subPage.model');

const getAllSubPages = () => {
 return SubPage.find({});
}
const createSubPage = (name) => {
  return SubPage.create({ name })
};

const deleteSubPage = (subPageId) => {
  return SubPage.findByIdAndDelete(subPageId);
};

module.exports = {
  getAllSubPages,
  createSubPage
};
