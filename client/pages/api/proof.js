// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const ethers = require("ethers");
const hcaptcha = require("hcaptcha");

export default async (req, res) => {
  try {
    const { data, token } = req.body;
    const result = await hcaptcha.verify(process.env.HCAPTCHA_SECRET, token);
    const { success, challenge_ts } = result;
    if (!success) {
      res.status(400).send({
        message: "failed challenge",
        extra: result,
      });
    }

    console.log(1);
    console.log(ethers);
    const timestamp = ethers.utils.hexZeroPad(
      ethers.utils.hexlify(Math.floor(new Date(challenge_ts).getTime() / 1000)),
      4
    );

    console.log(2);
    const hash = ethers.utils.keccak256(
      ethers.utils.hexConcat([data, timestamp])
    );
    console.log(3);
    const validatorSignature = await wallet.signMessage(
      ethers.utils.arrayify(hash)
    );

    console.log(4);
    const proof = ethers.utils.hexConcat([data, timestamp, validatorSignature]);

    res.status(200).json({ proof, timestamp: challenge_ts });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "something went wrong",
      error,
    });
  }
};
