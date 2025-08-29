// const { PrismaClient } = require("@prisma/client");
// const { validationResult } = require("express-validator");
// const { createAuditLog } = require("../utils/audit");
// const prisma = new PrismaClient();

// /**
//  * @desc Get all member countries
//  * @route GET /api/member-countries
//  * @access Public (ou Private selon tes besoins)
//  */
// module.exports.getAllMemberCountries = async (req, res) => {
//   try {
//     const { page = 1, limit = 20, search, status, sortBy = "name", sortOrder = "asc" } = req.query;
//     const skip = (page - 1) * limit;
//     const take = Number.parseInt(limit);

//     const where = {};
//     if (search) {
//       where.OR = [
//         { name: { contains: search, mode: "insensitive" } },
//         { code: { contains: search, mode: "insensitive" } },
//       ];
//     }
//     if (status) {
//       where.status = status;
//     }

//     const [countries, total] = await Promise.all([
//       prisma.memberCountry.findMany({
//         where,
//         skip,
//         take,
//         orderBy: { [sortBy]: sortOrder },
//         include: {
//           _count: {
//             select: { organizations: true },
//           },
//         },
//       }),
//       prisma.memberCountry.count({ where }),
//     ]);

//     res.status(200).json({
//       countries,
//       pagination: {
//         page: Number.parseInt(page),
//         limit: take,
//         total,
//         pages: Math.ceil(total / take),
//       },
//     });
//   } catch (error) {
//     console.error("Get all member countries error:", error);
//     res.status(500).json({
//       message: "Failed to retrieve member countries",
//       code: "GET_MEMBER_COUNTRIES_ERROR",
//     });
//   }
// };

// /**
//  * @desc Get member country by ID
//  * @route GET /api/member-countries/:id
//  * @access Public (ou Private selon tes besoins)
//  */
// module.exports.getMemberCountryById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const country = await prisma.memberCountry.findUnique({
//       where: { id },
//       include: {
//         _count: {
//           select: { organizations: true },
//         },
//       },
//     });

//     if (!country) {
//       return res.status(404).json({
//         message: "Member country not found",
//         code: "MEMBER_COUNTRY_NOT_FOUND",
//       });
//     }

//     res.status(200).json({ country });
//   } catch (error) {
//     console.error("Get member country by ID error:", error);
//     res.status(500).json({
//       message: "Failed to retrieve member country",
//       code: "GET_MEMBER_COUNTRY_ERROR",
//     });
//   }
// };

// /**
//  * @desc Create a new member country
//  * @route POST /api/member-countries
//  * @access Private (ADMIN)
//  */
// module.exports.createMemberCountry = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         message: "Validation errors",
//         errors: errors.array(),
//       });
//     }

//     const { name, code, flag, latitude, longitude, status = "ACTIVE" } = req.body;

//     // Vérifier si le pays ou le code existe déjà
//     const existingCountry = await prisma.memberCountry.findFirst({
//       where: {
//         OR: [
//           { name: { equals: name, mode: "insensitive" } },
//           { code: { equals: code, mode: "insensitive" } },
//         ],
//       },
//     });

//     if (existingCountry) {
//       return res.status(400).json({
//         message: "Country name or code already exists",
//         code: "COUNTRY_NAME_OR_CODE_EXISTS",
//       });
//     }

//     const country = await prisma.memberCountry.create({
//       data: {
//         name: name.trim(),
//         code: code.trim().toUpperCase(),
//         flag,
//         latitude: latitude ? Number(latitude) : null,
//         longitude: longitude ? Number(longitude) : null,
//         status,
//       },
//     });

//     await createAuditLog({
//       userId: res.locals.user.id,
//       action: "MEMBER_COUNTRY_CREATED",
//       resource: "member_countries",
//       resourceId: country.id,
//       details: { name: country.name, code: country.code, createdBy: res.locals.user.email },
//       ipAddress: req.ip,
//       userAgent: req.get("User-Agent"),
//     });

//     res.status(201).json({
//       message: "Member country created successfully",
//       country,
//     });
//   } catch (error) {
//     console.error("Create member country error:", error);
//     res.status(500).json({
//       message: "Failed to create member country",
//       code: "CREATE_MEMBER_COUNTRY_ERROR",
//     });
//   }
// };

// /**
//  * @desc Update a member country
//  * @route PUT /api/member-countries/:id
//  * @access Private (ADMIN)
//  */
// module.exports.updateMemberCountry = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         message: "Validation errors",
//         errors: errors.array(),
//       });
//     }

//     const { id } = req.params;
//     const { name, code, flag, latitude, longitude, status } = req.body;

//     const existingCountry = await prisma.memberCountry.findUnique({
//       where: { id },
//     });

//     if (!existingCountry) {
//       return res.status(404).json({
//         message: "Member country not found",
//         code: "MEMBER_COUNTRY_NOT_FOUND",
//       });
//     }

//     // Vérifier si le nouveau nom ou code est déjà utilisé par un autre pays
//     if (name && name.toLowerCase() !== existingCountry.name.toLowerCase()) {
//       const countryWithSameName = await prisma.memberCountry.findFirst({
//         where: { name: { equals: name, mode: "insensitive" } },
//       });
//       if (countryWithSameName) {
//         return res.status(400).json({
//           message: "Country name already exists",
//           code: "COUNTRY_NAME_EXISTS",
//         });
//       }
//     }

//     if (code && code.toUpperCase() !== existingCountry.code) {
//       const countryWithSameCode = await prisma.memberCountry.findFirst({
//         where: { code: { equals: code, mode: "insensitive" } },
//       });
//       if (countryWithSameCode) {
//         return res.status(400).json({
//           message: "Country code already exists",
//           code: "COUNTRY_CODE_EXISTS",
//         });
//       }
//     }

//     const updateData = {
//       name: name?.trim(),
//       code: code?.trim().toUpperCase(),
//       flag,
//       latitude: latitude ? Number(latitude) : null,
//       longitude: longitude ? Number(longitude) : null,
//       status,
//     };

//     const updatedCountry = await prisma.memberCountry.update({
//       where: { id },
//       data: updateData,
//     });

//     await createAuditLog({
//       userId: res.locals.user.id,
//       action: "MEMBER_COUNTRY_UPDATED",
//       resource: "member_countries",
//       resourceId: id,
//       details: { changes: updateData, updatedBy: res.locals.user.email },
//       ipAddress: req.ip,
//       userAgent: req.get("User-Agent"),
//     });

//     res.status(200).json({
//       message: "Member country updated successfully",
//       country: updatedCountry,
//     });
//   } catch (error) {
//     console.error("Update member country error:", error);
//     res.status(500).json({
//       message: "Failed to update member country",
//       code: "UPDATE_MEMBER_COUNTRY_ERROR",
//     });
//   }
// };

// /**
//  * @desc Delete a member country
//  * @route DELETE /api/member-countries/:id
//  * @access Private (ADMIN)
//  */
// module.exports.deleteMemberCountry = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const existingCountry = await prisma.memberCountry.findUnique({
//       where: { id },
//     });

//     if (!existingCountry) {
//       return res.status(404).json({
//         message: "Member country not found",
//         code: "MEMBER_COUNTRY_NOT_FOUND",
//       });
//     }

//     // Vérifier si le pays est utilisé par des organisations
//     const organizationsCount = await prisma.organization.count({
//       where: { country: existingCountry.name },
//     });

//     if (organizationsCount > 0) {
//       return res.status(400).json({
//         message: "Cannot delete country: it is used by one or more organizations",
//         code: "COUNTRY_IN_USE",
//       });
//     }

//     await prisma.memberCountry.delete({
//       where: { id },
//     });

//     await createAuditLog({
//       userId: res.locals.user.id,
//       action: "MEMBER_COUNTRY_DELETED",
//       resource: "member_countries",
//       resourceId: id,
//       details: { deletedCountry: existingCountry.name, deletedBy: res.locals.user.email },
//       ipAddress: req.ip,
//       userAgent: req.get("User-Agent"),
//     });

//     res.status(200).json({
//       message: "Member country deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete member country error:", error);
//     res.status(500).json({
//       message: "Failed to delete member country",
//       code: "DELETE_MEMBER_COUNTRY_ERROR",
//     });
//   }
// };

const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const { createAuditLog } = require("../utils/audit");
const prisma = new PrismaClient();

/**
 * @desc Get all member countries
 * @route GET /api/member-countries
 * @access Public
 */
module.exports.getAllMemberCountries = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, sortBy = "name", sortOrder = "asc" } = req.query;
    const skip = (page - 1) * limit;
    const take = Number.parseInt(limit);
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) {
      where.status = status;
    }
    const [datas, total] = await Promise.all([
      prisma.memberCountry.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          criteria: true,
          _count: {
            select: { criteria: true },
          },
        },
      }),
      prisma.memberCountry.count({ where }),
    ]);
    res.status(200).json({
      datas,
      pagination: {
        page: Number.parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error("Get all member countries error:", error);
    res.status(500).json({
      message: "Failed to retrieve member countries",
      code: "GET_MEMBER_COUNTRIES_ERROR",
    });
  }
};

/**
 * @desc Get member country by ID
 * @route GET /api/member-countries/:id
 * @access Public
 */
module.exports.getMemberCountryById = async (req, res) => {
  try {
    const { id } = req.params;
    const country = await prisma.memberCountry.findUnique({
      where: { id },
      include: {
        criteria: true,
        _count: {
          select: { criteria: true },
        },
      },
    });
    if (!country) {
      return res.status(404).json({
        message: "Member country not found",
        code: "MEMBER_COUNTRY_NOT_FOUND",
      });
    }
    res.status(200).json({ country });
  } catch (error) {
    console.error("Get member country by ID error:", error);
    res.status(500).json({
      message: "Failed to retrieve member country",
      code: "GET_MEMBER_COUNTRY_ERROR",
    });
  }
};

/**
 * @desc Create a new member country
 * @route POST /api/member-countries
 * @access Private (ADMIN)
 */
module.exports.createMemberCountry = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }
    const { name, code, flag, latitude, longitude, status = "ACTIVE" } = req.body;
    const existingCountry = await prisma.memberCountry.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: "insensitive" } },
          { code: { equals: code, mode: "insensitive" } },
        ],
      },
    });
    if (existingCountry) {
      return res.status(400).json({
        message: "Country name or code already exists",
        code: "COUNTRY_NAME_OR_CODE_EXISTS",
      });
    }
    const country = await prisma.memberCountry.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        flag,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        status,
      },
    });
    await createAuditLog({
      userId: res.locals.user.id,
      action: "MEMBER_COUNTRY_CREATED",
      resource: "member_countries",
      resourceId: country.id,
      details: { name: country.name, code: country.code, createdBy: res.locals.user.email },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });
    res.status(201).json({
      message: "Member country created successfully",
      country,
    });
  } catch (error) {
    console.error("Create member country error:", error);
    res.status(500).json({
      message: "Failed to create member country",
      code: "CREATE_MEMBER_COUNTRY_ERROR",
    });
  }
};

/**
 * @desc Update a member country
 * @route PUT /api/member-countries/:id
 * @access Private (ADMIN)
 */
module.exports.updateMemberCountry = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }
    const { id } = req.params;
    const { name, code, flag, latitude, longitude, status } = req.body;
    const existingCountry = await prisma.memberCountry.findUnique({
      where: { id },
    });
    if (!existingCountry) {
      return res.status(404).json({
        message: "Member country not found",
        code: "MEMBER_COUNTRY_NOT_FOUND",
      });
    }
    if (name && name.toLowerCase() !== existingCountry.name.toLowerCase()) {
      const countryWithSameName = await prisma.memberCountry.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
      });
      if (countryWithSameName) {
        return res.status(400).json({
          message: "Country name already exists",
          code: "COUNTRY_NAME_EXISTS",
        });
      }
    }
    if (code && code.toUpperCase() !== existingCountry.code) {
      const countryWithSameCode = await prisma.memberCountry.findFirst({
        where: { code: { equals: code, mode: "insensitive" } },
      });
      if (countryWithSameCode) {
        return res.status(400).json({
          message: "Country code already exists",
          code: "COUNTRY_CODE_EXISTS",
        });
      }
    }
    const updateData = {
      name: name?.trim(),
      code: code?.trim().toUpperCase(),
      flag,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      status,
    };
    const updatedCountry = await prisma.memberCountry.update({
      where: { id },
      data: updateData,
    });
    await createAuditLog({
      userId: res.locals.user.id,
      action: "MEMBER_COUNTRY_UPDATED",
      resource: "member_countries",
      resourceId: id,
      details: { changes: updateData, updatedBy: res.locals.user.email },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });
    res.status(200).json({
      message: "Member country updated successfully",
      country: updatedCountry,
    });
  } catch (error) {
    console.error("Update member country error:", error);
    res.status(500).json({
      message: "Failed to update member country",
      code: "UPDATE_MEMBER_COUNTRY_ERROR",
    });
  }
};

/**
 * @desc Delete a member country
 * @route DELETE /api/member-countries/:id
 * @access Private (ADMIN)
 */
module.exports.deleteMemberCountry = async (req, res) => {
  try {
    const { id } = req.params;
    const existingCountry = await prisma.memberCountry.findUnique({
      where: { id },
      include: { criteria: true },
    });
    if (!existingCountry) {
      return res.status(404).json({
        message: "Member country not found",
        code: "MEMBER_COUNTRY_NOT_FOUND",
      });
    }
    if (existingCountry.criteria.length > 0) {
      await prisma.critereMemberCountry.deleteMany({
        where: { memberCountryId: id },
      });
    }
    await prisma.memberCountry.delete({
      where: { id },
    });
    await createAuditLog({
      userId: res.locals.user.id,
      action: "MEMBER_COUNTRY_DELETED",
      resource: "member_countries",
      resourceId: id,
      details: { deletedCountry: existingCountry.name, deletedBy: res.locals.user.email },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });
    res.status(200).json({
      message: "Member country deleted successfully",
    });
  } catch (error) {
    console.error("Delete member country error:", error);
    res.status(500).json({
      message: "Failed to delete member country",
      code: "DELETE_MEMBER_COUNTRY_ERROR",
    });
  }
};

/**
 * @desc Get all criteria for a member country
 * @route GET /api/member-countries/:countryId/criteria
 * @access Public
 */
module.exports.getAllCriteriaForCountry = async (req, res) => {
  try {
    const { countryId } = req.params;
    const country = await prisma.memberCountry.findUnique({
      where: { id: countryId },
      include: { criteria: true },
    });
    if (!country) {
      return res.status(404).json({
        message: "Member country not found",
        code: "MEMBER_COUNTRY_NOT_FOUND",
      });
    }
    res.status(200).json({ criteria: country.criteria });
  } catch (error) {
    console.error("Get all criteria error:", error);
    res.status(500).json({
      message: "Failed to retrieve criteria",
      code: "GET_CRITERIA_ERROR",
    });
  }
};

/**
 * @desc Add a criterion to a member country
 * @route POST /api/member-countries/:countryId/criteria
 * @access Private (ADMIN)
 */
module.exports.addCriterionToCountry = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }
    const { countryId } = req.params;
    const { name, description } = req.body;
    const country = await prisma.memberCountry.findUnique({
      where: { id: countryId },
    });
    if (!country) {
      return res.status(404).json({
        message: "Member country not found",
        code: "MEMBER_COUNTRY_NOT_FOUND",
      });
    }
    const existingCriterion = await prisma.critereMemberCountry.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
      },
    });
    if (existingCriterion) {
      return res.status(400).json({
        message: "Criterion name already exists",
        code: "CRITERION_NAME_EXISTS",
      });
    }
    const criterion = await prisma.critereMemberCountry.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        memberCountryId: countryId,
      },
    });
    await createAuditLog({
      userId: res.locals.user.id,
      action: "CRITERION_ADDED_TO_COUNTRY",
      resource: "critere_member_countries",
      resourceId: criterion.id,
      details: { criterionName: criterion.name, countryName: country.name, addedBy: res.locals.user.email },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });
    res.status(201).json({
      message: "Criterion added successfully",
      criterion,
    });
  } catch (error) {
    console.error("Add criterion error:", error);
    res.status(500).json({
      message: "Failed to add criterion",
      code: "ADD_CRITERION_ERROR",
    });
  }
};

/**
 * @desc Update a criterion
 * @route PUT /api/member-countries/criteria/:criterionId
 * @access Private (ADMIN)
 */
module.exports.updateCriterion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }
    const { criterionId } = req.params;
    const { name, description } = req.body;
    const existingCriterion = await prisma.critereMemberCountry.findUnique({
      where: { id: criterionId },
    });
    if (!existingCriterion) {
      return res.status(404).json({
        message: "Criterion not found",
        code: "CRITERION_NOT_FOUND",
      });
    }
    if (name && name.toLowerCase() !== existingCriterion.name.toLowerCase()) {
      const criterionWithSameName = await prisma.critereMemberCountry.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
      });
      if (criterionWithSameName) {
        return res.status(400).json({
          message: "Criterion name already exists",
          code: "CRITERION_NAME_EXISTS",
        });
      }
    }
    const updatedCriterion = await prisma.critereMemberCountry.update({
      where: { id: criterionId },
      data: {
        name: name?.trim(),
        description: description?.trim(),
      },
    });
    await createAuditLog({
      userId: res.locals.user.id,
      action: "CRITERION_UPDATED",
      resource: "critere_member_countries",
      resourceId: criterionId,
      details: { changes: { name: updatedCriterion.name, description: updatedCriterion.description }, updatedBy: res.locals.user.email },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });
    res.status(200).json({
      message: "Criterion updated successfully",
      criterion: updatedCriterion,
    });
  } catch (error) {
    console.error("Update criterion error:", error);
    res.status(500).json({
      message: "Failed to update criterion",
      code: "UPDATE_CRITERION_ERROR",
    });
  }
};

/**
 * @desc Delete a criterion
 * @route DELETE /api/member-countries/criteria/:criterionId
 * @access Private (ADMIN)
 */
module.exports.deleteCriterion = async (req, res) => {
  try {
    const { criterionId } = req.params;
    const existingCriterion = await prisma.critereMemberCountry.findUnique({
      where: { id: criterionId },
    });
    if (!existingCriterion) {
      return res.status(404).json({
        message: "Criterion not found",
        code: "CRITERION_NOT_FOUND",
      });
    }
    await prisma.critereMemberCountry.delete({
      where: { id: criterionId },
    });
    await createAuditLog({
      userId: res.locals.user.id,
      action: "CRITERION_DELETED",
      resource: "critere_member_countries",
      resourceId: criterionId,
      details: { deletedCriterion: existingCriterion.name, deletedBy: res.locals.user.email },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });
    res.status(200).json({
      message: "Criterion deleted successfully",
    });
  } catch (error) {
    console.error("Delete criterion error:", error);
    res.status(500).json({
      message: "Failed to delete criterion",
      code: "DELETE_CRITERION_ERROR",
    });
  }
};
