const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

// The `/api/tags` endpoint

router.get("/", async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tagData = await Category.findAll({
      include: [Product],
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tagData = await Category.findByPk(req.params.id, {
      include: [Product],
    });
    if (!tagData) {
      res.status(404).json({ message: "No tag with this id!" });
      return;
    }
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", async (req, res) => {
  // create a new tag
  try {
    const tagData = await Tag.create(req.body);
    res.status(200).json(tagData);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/", async (req, res) => {
Tag.create(req.body)
  .then((tag) => {
    // if there's product tags, we need to create pairings to bulk create in the ProductTag model
    if (req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((product_id) => {
        return {
          tag_id: tag.id,
          product_id,
        };
      });
      return ProductTag.bulkCreate(productTagIdArr);
    }
    // if no product tags, just respond
    res.status(200).json(tag);
  })
  .then((productTagIds) => res.status(200).json(productTagIds))
  .catch((err) => {
    console.log(err);
    res.status(400).json(err);
  });
});


router.put("/:id", (req, res) => {
  // update a tag's name by its `id` value
  // update product data
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((tag) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        Tag.findAll({
          where: { tag_id: req.params.id },
        }).then((tagUpdate) => {
          // create filtered list of new tag_ids
          const tagIds = tagUpdate.map(({ tag_id }) => tag_id);
          const newTags = req.body.tagIds
            .filter((product_id) => !tagIds.includes(product_id))
            .map((product_id) => {
              return {
                tag_id: req.params.id,
                product_id,
              };
            });

          // figure out which ones to remove
          const tagsToRemove = tagUpdate
            .filter(({ product_id }) => !req.body.tagIds.includes(product_id))
            .map(({ id }) => id);
          // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: tagsToRemove } }),
            ProductTag.bulkCreate(newTags),
          ]);
        });
      }

      return res.json(tag);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete("/:id", async (req, res) => {
  // delete on tag by its `id` value
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!tagData) {
      res.status(404).json({ message: "No location found with this id!" });
      return;
    }

    res.status(200).json(locationData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
