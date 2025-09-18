const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err.message);

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            error: 'File terlalu besar. Maksimal 200MB.',
            code: 'FILE_TOO_LARGE'
        });
    }

    if (err.message === 'Only ZIP files are allowed') {
        return res.status(400).json({
            error: 'Hanya file ZIP yang diperbolehkan.',
            code: 'INVALID_FILE_TYPE'
        });
    }

    if (err.code === 'ENOENT') {
        return res.status(404).json({
            error: 'File tidak ditemukan.',
            code: 'FILE_NOT_FOUND'
        });
    }

    res.status(500).json({
        error: 'Terjadi kesalahan internal server.',
        code: 'INTERNAL_ERROR'
    });
};

module.exports = { errorHandler };