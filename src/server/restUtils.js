module.exports = class RestUtils {
    constructor(sfdc) {
        this.sfdc = sfdc;
    }

    doApexGet(url, req, res) {
        this.sfdc.apex.get(url, (err, apexResponse) => {
            if (err) {
                res.status(500).send(err);
            } else {
                let responseJson = JSON.parse(apexResponse);
                if (responseJson.isSuccess) {
                    res.json(responseJson.data);
                } else {
                    res.status(400).json({ message: responseJson.errorMsg });
                }
            }
        });
    }

    doApexPost(url, body, res) {
        this.sfdc.apex.post(url, body, (err, apexResponse) => {
            if (err) {
                res.status(500).send(err);
            } else {
                let responseJson = apexResponse;
                if (responseJson.isSuccess) {
                    res.json(responseJson.data);
                } else {
                    res.status(400).json({ message: responseJson.errorMsg });
                }
            }
        });
    }
};
