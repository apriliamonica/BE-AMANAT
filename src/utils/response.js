export class ApiResponse {
  static success(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, message = "Error", statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  static paginate(res, data, page, limit, total, message = "Success") {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const totalNum = parseInt(total) || 0;

    // Prevent division by zero
    const totalPages = limitNum > 0 ? Math.ceil(totalNum / limitNum) : 0;

    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalNum,
        totalPages,
        hasNextPage: pageNum * limitNum < totalNum,
        hasPrevPage: pageNum > 1,
      },
    });
  }
}
