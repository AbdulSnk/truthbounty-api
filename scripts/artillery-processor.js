module.exports = { generatePayload };

function generatePayload(requestParams, context, ee, next) {
    context.vars.claimId = `claim-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    return next();
}
