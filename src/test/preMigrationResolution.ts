/**
 * Resolved guidance for every food in the catalogue immediately before the F-12 migration
 * (commit e3d5c5c), keyed by food id then guidance-list id. Synthetic record ids are excluded
 * deliberately: they differ where reviewed content does not.
 */
export const preMigrationResolution = {
  "albacore-tuna": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "alfonsino": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "anchovy": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "apple-pie": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-check-ingredients",
      "summary": "Traditional apple pie crust can contain lard, so check the ingredients.",
      "scenarios": [],
      "citations": [
        {
          "title": "Veggy Malta: 15 Products Not Vegetarian",
          "url": "https://veggymalta.com/15-products-not-vegetarian/",
          "locator": "15 non-vegetarian foods: Apple pie"
        }
      ]
    }
  },
  "arrow-squid": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "barracouta": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "bass": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "blue-cheese": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Eat low-acid soft pasteurised cheese only when it is cooked.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Cook thoroughly before eating.",
          "conditions": [
            {
              "kind": "preparation",
              "instruction": "Do not eat it uncooked."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Cheese — Low acid soft pasteurised cheese"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "blue-cod": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "bluenose": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "bluff-and-pacific-oysters": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit these shellfish to one serving each month.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit intake during pregnancy.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than one serving per month."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Seafood footnote: Bluff and Pacific oysters and queen scallops"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "breakfast-cereals": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this food as okay to eat.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Breads and cereals: Cereals — Breakfast cereals, rice, pasta, and similar"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "brie": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Eat low-acid soft pasteurised cheese only when it is cooked.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Cook thoroughly before eating.",
          "conditions": [
            {
              "kind": "preparation",
              "instruction": "Do not eat it uncooked."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Cheese — Low acid soft pasteurised cheese"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "brill-and-turbot": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "brown-seaweed": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit brown seaweed to one serve each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit intake during pregnancy.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than one serving per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Miscellaneous: Seaweed — Brown seaweed"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "brown-trout": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "The guide lists this trout as unrestricted only outside its stated excluded location.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Follow the source’s location exception.",
          "conditions": [
            {
              "kind": "other",
              "instruction": "Do not treat the listed excluded lake or geothermal source as unrestricted."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "butter": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this food as okay to eat.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Butter; Ice cream — Packaged"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "camembert": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Eat low-acid soft pasteurised cheese only when it is cooked.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Cook thoroughly before eating.",
          "conditions": [
            {
              "kind": "preparation",
              "instruction": "Do not eat it uncooked."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Cheese — Low acid soft pasteurised cheese"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "canned-foods": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Remove leftovers from the can, refrigerate them covered, and eat them within two days.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Store uneaten leftovers covered in the fridge.",
          "conditions": [
            {
              "kind": "storage",
              "instruction": "Store covered leftovers in the fridge and eat them within two days."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Miscellaneous: Canned foods"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "cardinal-fish": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to one serving every one or two weeks.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit intake during pregnancy.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than one serving every one or two weeks."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 1 serving per 1–2 weeks acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "cheddar": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists hard cheese as okay to eat when refrigerated.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Cheese — Hard cheese"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-check-ingredients",
      "summary": "Traditional hard cheese can be set using animal-derived rennet, so check the label.",
      "scenarios": [],
      "citations": []
    }
  },
  "chicken-or-turkey-stuffing": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Eat chicken or turkey stuffing only when it is cooked separately and served hot.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Cook stuffing in a separate dish and serve hot.",
          "conditions": [
            {
              "kind": "storage",
              "instruction": "Keep leftovers in the fridge for no more than two days."
            },
            {
              "kind": "serving",
              "instruction": "Reheat leftovers above 75°C."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Miscellaneous: Stuffing"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "chilled-smoked-or-pre-cooked-seafood": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Eat chilled smoked or pre-cooked seafood only after heating until piping hot.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Heat until piping hot before eating.",
          "conditions": [
            {
              "kind": "serving",
              "instruction": "Heat above 75°C."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Seafood: Smoked fish, shellfish and crustacea"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "cockles": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "cold-cooked-poultry": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Eat only after heating until piping hot.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Heat until piping hot before eating.",
          "conditions": [
            {
              "kind": "serving",
              "instruction": "Heat above 75°C."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Meat and poultry: Processed meats; Cold cooked poultry"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "commercial-sauces-dressings-and-spreads": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Refrigerate opened products and follow their manufacturer storage and heating instructions.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Follow the manufacturer’s instructions after opening.",
          "conditions": [
            {
              "kind": "storage",
              "instruction": "Refrigerate opened products and observe the stated storage limit."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Miscellaneous: Sauces, dressings and spreads"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "cooked-eggs": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Cook eggs until the yolk and scrambled egg are firm.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Cook eggs well before eating.",
          "conditions": [
            {
              "kind": "preparation",
              "instruction": "Ensure yolks and scrambled eggs are firm."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Eggs: Cooked eggs"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "cooked-meat-and-poultry": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Cook meat and poultry thoroughly, eat it hot, and reheat leftovers before serving.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Cook thoroughly and serve while hot.",
          "conditions": [
            {
              "kind": "preparation",
              "instruction": "Cook until piping hot throughout and the juices run clear."
            },
            {
              "kind": "storage",
              "instruction": "Store covered leftovers in the fridge for no more than two days."
            },
            {
              "kind": "serving",
              "instruction": "Reheat leftovers and cold cooked meat above 75°C."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Meat and poultry: Cooked meats"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "cottage-cheese": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Use pasteurised cheese from sealed packs within two days of opening, or cook it before its best-before date.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Follow the sealed-pack, refrigeration, and use-by guidance.",
          "conditions": [
            {
              "kind": "storage",
              "instruction": "Keep in its sealed pack and eat cold within two days of opening."
            },
            {
              "kind": "preparation",
              "instruction": "Alternatively, cook it before the package best-before date."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Cheese — Pasteurised cottage cheese, cream cheese, etc"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "cream": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Use cream from a sealed pack and eat it within two days of opening.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Keep refrigerated in its original packaging and prevent contamination.",
          "conditions": [
            {
              "kind": "storage",
              "instruction": "Eat within two days of opening the pack."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Cream"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "cream-cheese": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Use pasteurised cheese from sealed packs within two days of opening, or cook it before its best-before date.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Follow the sealed-pack, refrigeration, and use-by guidance.",
          "conditions": [
            {
              "kind": "storage",
              "instruction": "Keep in its sealed pack and eat cold within two days of opening."
            },
            {
              "kind": "preparation",
              "instruction": "Alternatively, cook it before the package best-before date."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Cheese — Pasteurised cottage cheese, cream cheese, etc"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "dogfish": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to one serving every one or two weeks.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit intake during pregnancy.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than one serving every one or two weeks."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 1 serving per 1–2 weeks acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "dried-herbs": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Cook dried herbs thoroughly before eating.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Cook thoroughly before eating.",
          "conditions": [
            {
              "kind": "preparation",
              "instruction": "Do not use dried herbs uncooked."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Vegetables, salads and fruits: Herbs — Dried herbs"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "eel": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "elephant-fish": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "farmed-salmon": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "feta": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Eat low-acid soft pasteurised cheese only when it is cooked.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Cook thoroughly before eating.",
          "conditions": [
            {
              "kind": "preparation",
              "instruction": "Do not eat it uncooked."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Cheese — Low acid soft pasteurised cheese"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "flounders": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "french-fries": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-check-ingredients",
      "summary": "Restaurant fries can be cooked in animal fats, so ask how they are prepared.",
      "scenarios": [],
      "citations": [
        {
          "title": "Veggy Malta: 15 Products Not Vegetarian",
          "url": "https://veggymalta.com/15-products-not-vegetarian/",
          "locator": "15 non-vegetarian foods: French fries"
        }
      ]
    }
  },
  "fresh-filled-pasta": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Check the guidance for the filling before eating fresh filled pasta.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Follow the advice specific to the filling.",
          "conditions": [
            {
              "kind": "composition",
              "instruction": "Do not treat the general pasta advice as applying to fresh filled pasta."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Breads and cereals: Cereals"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "fresh-fruit": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Wash this food carefully before use.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Wash well before eating raw or before cooking.",
          "conditions": []
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Vegetables, salads and fruits: Fruit; Vegetables; Salads — Home-made"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "fresh-herbs": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Wash fresh herbs well before using.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Wash well before using.",
          "conditions": []
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Vegetables, salads and fruits: Herbs — Fresh home-grown and store-bought"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "fresh-vegetables": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Wash this food carefully before use.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Wash well before eating raw or before cooking.",
          "conditions": []
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Vegetables, salads and fruits: Fruit; Vegetables; Salads — Home-made"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "freshly-cooked-seafood": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Cook seafood thoroughly and eat it while hot.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Cook thoroughly and serve while hot.",
          "conditions": [
            {
              "kind": "preparation",
              "instruction": "Cook above 75°C throughout."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Seafood: Freshly cooked fish, mussels, oysters, crayfish, scallops, etc"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "frozen-vegetables": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Cook before eating.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Cook before eating.",
          "conditions": [
            {
              "kind": "preparation",
              "instruction": "Do not eat uncooked frozen produce."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Vegetables, salads and fruits: Fruit — Imported frozen berries; Vegetables — Frozen vegetables"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "gelatin": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-animal-derived",
      "summary": "Gelatin is an animal-derived gelling ingredient.",
      "scenarios": [],
      "citations": [
        {
          "title": "Veggy Malta: 15 Products Not Vegetarian",
          "url": "https://veggymalta.com/15-products-not-vegetarian/",
          "locator": "15 non-vegetarian foods: Gummy Bears; Marshmallows; Panna Cotta; Starburst"
        }
      ]
    }
  },
  "geothermal-lake-trout": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to one serving every one or two weeks.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit intake during pregnancy.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than one serving every one or two weeks."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 1 serving per 1–2 weeks acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "ghost-sharks": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "gouda": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists hard cheese as okay to eat when refrigerated.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Cheese — Hard cheese"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-check-ingredients",
      "summary": "Traditional hard cheese can be set using animal-derived rennet, so check the label.",
      "scenarios": [],
      "citations": []
    }
  },
  "gummy-bears": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-check-ingredients",
      "summary": "Gummy bears can contain gelatin; gelatin-free alternatives exist.",
      "scenarios": [],
      "citations": [
        {
          "title": "Veggy Malta: 15 Products Not Vegetarian",
          "url": "https://veggymalta.com/15-products-not-vegetarian/",
          "locator": "15 non-vegetarian foods: Gummy Bears"
        }
      ]
    }
  },
  "gurnard": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "hake": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "halloumi": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Eat low-acid soft pasteurised cheese only when it is cooked.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Cook thoroughly before eating.",
          "conditions": [
            {
              "kind": "preparation",
              "instruction": "Do not eat it uncooked."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Cheese — Low acid soft pasteurised cheese"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "hapuka-or-groper": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "hoki": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "home-made-custard": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Eat home-made custard hot after cooking; reheat leftovers until piping hot.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Serve immediately after cooking or reheat leftovers before serving.",
          "conditions": [
            {
              "kind": "serving",
              "instruction": "Reheat leftovers above 75°C and eat immediately."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Custard — Home-made"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "home-made-salads": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Wash this food carefully before use.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Wash well before eating raw or before cooking.",
          "conditions": []
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Vegetables, salads and fruits: Fruit; Vegetables; Salads — Home-made"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "home-made-sushi": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Use freshly cooked rice, avoid raw or cold cooked meat or seafood, and eat immediately.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Prepare with freshly cooked rice and eat immediately.",
          "conditions": [
            {
              "kind": "composition",
              "instruction": "Do not use raw or cold cooked meat or seafood."
            },
            {
              "kind": "serving",
              "instruction": "Do not keep leftovers."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Miscellaneous: Sushi — Home-made"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "hummus-and-tahini-dips": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-avoid",
      "summary": "The guide says not to eat this during pregnancy.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Miscellaneous: Sushi — Store-bought; Hummus and other dips containing tahini"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "imported-frozen-berries": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Cook before eating.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Cook before eating.",
          "conditions": [
            {
              "kind": "preparation",
              "instruction": "Do not eat uncooked frozen produce."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Vegetables, salads and fruits: Fruit — Imported frozen berries; Vegetables — Frozen vegetables"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "javelin-fish": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "jelly": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-check-ingredients",
      "summary": "Check whether jelly contains animal-derived ingredients; vegan alternatives exist.",
      "scenarios": [],
      "citations": [
        {
          "title": "Veggy Malta: 15 Products Not Vegetarian",
          "url": "https://veggymalta.com/15-products-not-vegetarian/",
          "locator": "15 non-vegetarian foods: Jelly"
        }
      ]
    }
  },
  "john-dory": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "kahawai": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "kingfish": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "lake-rotomahana-trout": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to one serving every one or two weeks.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit intake during pregnancy.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than one serving every one or two weeks."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 1 serving per 1–2 weeks acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "lake-taupo-trout": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "leatherjacket": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "leftover-cooked-foods": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Keep refrigerated leftovers for no more than two days and reheat them before eating.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Store covered in the fridge and reheat before serving.",
          "conditions": [
            {
              "kind": "storage",
              "instruction": "Eat refrigerated leftovers within two days."
            },
            {
              "kind": "serving",
              "instruction": "Reheat above 75°C; do not eat cold leftovers."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Miscellaneous: Leftovers — Cooked foods"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "lemon-sole": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "ling": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "mackerel": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "marshmallows": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-animal-derived",
      "summary": "Marshmallows traditionally contain animal-derived gelatin.",
      "scenarios": [],
      "citations": [
        {
          "title": "Veggy Malta: 15 Products Not Vegetarian",
          "url": "https://veggymalta.com/15-products-not-vegetarian/",
          "locator": "15 non-vegetarian foods: Marshmallows"
        }
      ]
    }
  },
  "monkfish-or-stargazer": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "mozzarella": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Eat low-acid soft pasteurised cheese only when it is cooked.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Cook thoroughly before eating.",
          "conditions": [
            {
              "kind": "preparation",
              "instruction": "Do not eat it uncooked."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Cheese — Low acid soft pasteurised cheese"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "mussels": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Cook thoroughly, eat while hot, and follow the source’s species-specific mercury notes.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Cook thoroughly and serve while hot.",
          "conditions": [
            {
              "kind": "preparation",
              "instruction": "Cook above 75°C throughout."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Seafood: Freshly cooked fish, mussels, oysters, crayfish, scallops, etc; Recommended fish servings"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "orange-juice": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-check-ingredients",
      "summary": "Some orange juice brands add omega-3 derived from fish.",
      "scenarios": [],
      "citations": [
        {
          "title": "Veggy Malta: 15 Products Not Vegetarian",
          "url": "https://veggymalta.com/15-products-not-vegetarian/",
          "locator": "15 non-vegetarian foods: Orange juice"
        }
      ]
    }
  },
  "orange-perch": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "orange-roughy": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "oreo-dories": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "oysters": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Cook thoroughly, eat while hot, and follow the source’s species-specific mercury notes.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Cook thoroughly and serve while hot.",
          "conditions": [
            {
              "kind": "preparation",
              "instruction": "Cook above 75°C throughout."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Seafood: Freshly cooked fish, mussels, oysters, crayfish, scallops, etc; Recommended fish servings"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "packaged-ice-cream": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this food as okay to eat.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Butter; Ice cream — Packaged"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "paneer": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Eat low-acid soft pasteurised cheese only when it is cooked.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Cook thoroughly before eating.",
          "conditions": [
            {
              "kind": "preparation",
              "instruction": "Do not eat it uncooked."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Cheese — Low acid soft pasteurised cheese"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "panna-cotta": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-animal-derived",
      "summary": "Panna cotta traditionally uses gelatin to set.",
      "scenarios": [],
      "citations": [
        {
          "title": "Veggy Malta: 15 Products Not Vegetarian",
          "url": "https://veggymalta.com/15-products-not-vegetarian/",
          "locator": "15 non-vegetarian foods: Panna Cotta"
        }
      ]
    }
  },
  "parmesan": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists hard cheese as okay to eat when refrigerated.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Cheese — Hard cheese"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-animal-derived",
      "summary": "Traditional Parmesan uses animal-derived rennet.",
      "scenarios": [],
      "citations": [
        {
          "title": "Veggy Malta: 15 Products Not Vegetarian",
          "url": "https://veggymalta.com/15-products-not-vegetarian/",
          "locator": "15 non-vegetarian foods: Parmesan"
        }
      ]
    }
  },
  "parore": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "pasta": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this food as okay to eat.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Breads and cereals: Cereals — Breakfast cereals, rice, pasta, and similar"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "pasteurised-fruit-juice-kombucha-and-cider": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists pasteurised drinks in this group as okay to drink.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Miscellaneous: Fruit juice, kombucha and cider (non-alcoholic) — Pasteurised"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "pasteurised-milk": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Use pasteurised dairy under the manufacturer’s storage guidance.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Keep refrigerated and avoid contaminating the packaging.",
          "conditions": [
            {
              "kind": "storage",
              "instruction": "Follow the package best-before and storage instructions."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Milk — Pasteurised; Yoghurt — Pasteurised"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "pasteurised-yoghurt": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Use pasteurised dairy under the manufacturer’s storage guidance.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Keep refrigerated and avoid contaminating the packaging.",
          "conditions": [
            {
              "kind": "storage",
              "instruction": "Follow the package best-before and storage instructions."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Milk — Pasteurised; Yoghurt — Pasteurised"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-check-ingredients",
      "summary": "Some yoghurts use gelatin as a gelling agent, so check the label.",
      "scenarios": [],
      "citations": [
        {
          "title": "Veggy Malta: 15 Products Not Vegetarian",
          "url": "https://veggymalta.com/15-products-not-vegetarian/",
          "locator": "15 non-vegetarian foods: Yogurt"
        }
      ]
    }
  },
  "pre-packaged-and-ready-made-salads": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-avoid",
      "summary": "The guide says not to eat pre-packaged or ready-made salads.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Vegetables, salads and fruits: Salads — Pre-packaged and ready-made"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "processed-meats": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Eat only after heating until piping hot.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Heat until piping hot before eating.",
          "conditions": [
            {
              "kind": "serving",
              "instruction": "Heat above 75°C."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Meat and poultry: Processed meats; Cold cooked poultry"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "queen-scallops": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit these shellfish to one serving each month.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit intake during pregnancy.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than one serving per month."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Seafood footnote: Bluff and Pacific oysters and queen scallops"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "rainbow-trout": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "The guide lists this trout as unrestricted only outside its stated excluded location.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Follow the source’s location exception.",
          "conditions": [
            {
              "kind": "other",
              "instruction": "Do not treat the listed excluded lake or geothermal source as unrestricted."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "raw-eggs-and-raw-egg-foods": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-avoid",
      "summary": "The guide says not to eat raw eggs or foods made with them.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Eggs: Raw eggs"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "raw-fish": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-avoid",
      "summary": "The guide says not to eat raw seafood.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Seafood: Raw fish; Raw shellfish"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "raw-meat-and-poultry": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-avoid",
      "summary": "Do not eat or taste raw meat or poultry.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Meat and poultry: Raw meat"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "raw-shellfish": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-avoid",
      "summary": "The guide says not to eat raw seafood.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Seafood: Raw fish; Raw shellfish"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "ready-made-chilled-custard": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Keep packaged chilled custard refrigerated and eat it within two days of opening.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Keep refrigerated in its original packaging.",
          "conditions": [
            {
              "kind": "storage",
              "instruction": "Eat within two days of opening."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Custard — Ready-made chilled (packaged)"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "red-and-green-seaweed": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists red and green seaweed as okay to eat; sushi advice still applies when relevant.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Miscellaneous: Seaweed — Red or green seaweed"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "red-cod": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "ribaldo": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "rice": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this food as okay to eat.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Breads and cereals: Cereals — Breakfast cereals, rice, pasta, and similar"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "ricotta": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Eat low-acid soft pasteurised cheese only when it is cooked.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Cook thoroughly before eating.",
          "conditions": [
            {
              "kind": "preparation",
              "instruction": "Do not eat it uncooked."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Cheese — Low acid soft pasteurised cheese"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "rig": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "rock-lobster": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "scallops": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Cook thoroughly, eat while hot, and follow the source’s species-specific mercury notes.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Cook thoroughly and serve while hot.",
          "conditions": [
            {
              "kind": "preparation",
              "instruction": "Cook above 75°C throughout."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Seafood: Freshly cooked fish, mussels, oysters, crayfish, scallops, etc; Recommended fish servings"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "school-shark": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to one serving every one or two weeks.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit intake during pregnancy.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than one serving every one or two weeks."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 1 serving per 1–2 weeks acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "sea-perch": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "seed-sprouts-and-enoki-mushrooms": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Do not eat these raw; cook them first.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Cook before eating.",
          "conditions": [
            {
              "kind": "preparation",
              "instruction": "Do not eat raw."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Miscellaneous: Sprouts and enoki mushrooms"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "silverside": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "skate": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "skipjack-tuna": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists skipjack tuna as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "smooth-oreo": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "snapper": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "soft-serve-ice-cream": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-avoid",
      "summary": "The guide says not to eat this during pregnancy.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Unpasteurised milk and dairy products; Ice cream — Soft serve"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "sole": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "southern-blue-whiting": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "southern-bluefin-tuna": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to one serving every one or two weeks.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit intake during pregnancy.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than one serving every one or two weeks."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 1 serving per 1–2 weeks acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "sprats": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "starburst": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-animal-derived",
      "summary": "The article identifies Starburst as containing gelatin.",
      "scenarios": [],
      "citations": [
        {
          "title": "Veggy Malta: 15 Products Not Vegetarian",
          "url": "https://veggymalta.com/15-products-not-vegetarian/",
          "locator": "15 non-vegetarian foods: Starburst"
        }
      ]
    }
  },
  "store-bought-sushi": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-avoid",
      "summary": "The guide says not to eat this during pregnancy.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Miscellaneous: Sushi — Store-bought; Hummus and other dips containing tahini"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "striped-marlin": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to one serving every one or two weeks.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit intake during pregnancy.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than one serving every one or two weeks."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 1 serving per 1–2 weeks acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "surf-clams": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "swordfish": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to one serving every one or two weeks.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit intake during pregnancy.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than one serving every one or two weeks."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 1 serving per 1–2 weeks acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "tarakihi": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "toothfish": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "tortillas": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-check-ingredients",
      "summary": "Some tortillas use lard, so check the ingredients or ask the cook.",
      "scenarios": [],
      "citations": [
        {
          "title": "Veggy Malta: 15 Products Not Vegetarian",
          "url": "https://veggymalta.com/15-products-not-vegetarian/",
          "locator": "15 non-vegetarian foods: Tortillas"
        }
      ]
    }
  },
  "trevally": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-conditions",
      "summary": "Limit this species to three or four servings each week.",
      "scenarios": [
        {
          "applicability": "When preparing or serving this food",
          "instruction": "Limit weekly intake.",
          "conditions": [
            {
              "kind": "frequency",
              "instruction": "Have no more than three or four servings per week."
            }
          ]
        }
      ],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "unpasteurised-fruit-juice-kombucha-and-cider": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-avoid",
      "summary": "The guide says not to drink unpasteurised drinks in this group.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Miscellaneous: Fruit juice, kombucha and cider (non-alcoholic) — Unpasteurised (raw)"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "unpasteurised-milk-and-dairy-products": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-avoid",
      "summary": "The guide says not to eat this during pregnancy.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Dairy: Unpasteurised milk and dairy products; Ice cream — Soft serve"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "vegetable-soup": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-check-ingredients",
      "summary": "Restaurant vegetable soup can contain chicken broth, so ask about the ingredients.",
      "scenarios": [],
      "citations": [
        {
          "title": "Veggy Malta: 15 Products Not Vegetarian",
          "url": "https://veggymalta.com/15-products-not-vegetarian/",
          "locator": "15 non-vegetarian foods: Vegetables soups"
        }
      ]
    }
  },
  "warehou": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "white-sugar": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-check-ingredients",
      "summary": "White sugar can be refined using bone char, so check how it is processed.",
      "scenarios": [],
      "citations": [
        {
          "title": "Veggy Malta: 15 Products Not Vegetarian",
          "url": "https://veggymalta.com/15-products-not-vegetarian/",
          "locator": "15 non-vegetarian foods: White sugar"
        }
      ]
    }
  },
  "whitebait": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-ok",
      "summary": "The guide lists this species as requiring no mercury-serving restriction.",
      "scenarios": [],
      "citations": [
        {
          "title": "New Zealand Food Safety: Pullout guide to food safety in pregnancy",
          "url": "https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy",
          "locator": "Recommended servings for fish species to minimise mercury intakes: No restriction necessary"
        }
      ]
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  },
  "wine-and-beer": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-check-ingredients",
      "summary": "Some wines and beers use fish-derived isinglass; vegetarian alternatives exist.",
      "scenarios": [],
      "citations": [
        {
          "title": "Veggy Malta: 15 Products Not Vegetarian",
          "url": "https://veggymalta.com/15-products-not-vegetarian/",
          "locator": "15 non-vegetarian foods: Wines & Beer"
        }
      ]
    }
  },
  "worcestershire-sauce": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-check-ingredients",
      "summary": "Worcestershire sauce can contain anchovies; vegan alternatives exist.",
      "scenarios": [],
      "citations": [
        {
          "title": "Veggy Malta: 15 Products Not Vegetarian",
          "url": "https://veggymalta.com/15-products-not-vegetarian/",
          "locator": "15 non-vegetarian foods: Worcestershire sauce"
        }
      ]
    }
  },
  "yellowfin-tuna": {
    "pregnancy-food-safety": {
      "statusId": "pregnancy-not-assessed",
      "summary": null,
      "scenarios": [],
      "citations": []
    },
    "vegetarian-suitability": {
      "statusId": "vegetarian-outside-coverage",
      "summary": null,
      "scenarios": [],
      "citations": []
    }
  }
}

