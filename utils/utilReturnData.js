const returnSuccess = (data, res) => {
    const statusCode = data.done ? 200 : 500;
    console.log(data);
    var result = {
        status : statusCode,
        data : [...data?.records]
    }
    return res.json(result);
}

const returnError = (data, res) => {
    var result = {
        status : 400,
        name : data?.Name
    }
    return  res.json(result);
}


const UtilReturnData = {
    returnSuccess : returnSuccess,
    returnError : returnError
}

module.exports = UtilReturnData;