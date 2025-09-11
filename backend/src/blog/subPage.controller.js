const subPageDao = require('../daos/subPage.dao');

const createSubPage = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Page name required' });
    }

    const subPage = await subPageDao.createSubPage(name);

    res.status(200).json(subPage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create page' });
  }
};

const getAllSubpages = async (req, res) => {
  try {
    const subPages = await subPageDao.getAllSubPages()
    res.status(200).json(subPages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pages' })
  }
}

module.exports = {
  createSubPage,
  getAllSubpages,
};
