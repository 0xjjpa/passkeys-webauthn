const { expect } = require("chai");
const crypto = require("crypto");

function derToRS(der) {
  var offset = 3;
  var dataOffset;

  if (der[offset] == 0x21) {
    dataOffset = offset + 2;
  }
  else {
    dataOffset = offset + 1;
  }
  const r = der.slice(dataOffset, dataOffset + 32);
  offset = offset + der[offset] + 1 + 1
  if (der[offset] == 0x21) {
    dataOffset = offset + 2;
  }
  else {
    dataOffset = offset + 1;
  }
  const s = der.slice(dataOffset, dataOffset + 32);
  return [r, s]
}

function bufferToHex(buffer) {
  return ("0x").concat([...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join(""));
}

async function getKey(pubkey) {
  const algoParams = {
    name: 'ECDSA',
    namedCurve: 'P-256',
    hash: 'SHA-256',
  };
  return await crypto.subtle.importKey('spki', pubkey, algoParams, true, ['verify'])
}

function bufferFromBase64(value) {
  return Buffer.from(value, "base64")
}

describe("Webauthn", function () {
  it("Check message", async function () {
    const Webauthn = await ethers.getContractFactory("Webauthn");
    const webauthn = await Webauthn.deploy();
    await webauthn.deployed();

    const publicKey = Buffer.from("3059301306072a8648ce3d020106082a8648ce3d030107034200049a6d97cfdbba34a56524a5427e5f22cf0e74cfde780da60e2657cdc4ef933f3f05f247b86d111bc407cada94d74e081731c5d94b11ff4b4a33f1ac801ac63229", "hex");
    const rawPubkey = await crypto.subtle.exportKey("jwk", await getKey(publicKey))
    const { x, y } = rawPubkey;
    const pubkeyUintArray = [
      ethers.BigNumber.from(bufferToHex(bufferFromBase64(x))),
      ethers.BigNumber.from(bufferToHex(bufferFromBase64(y)))
    ]

    const signature = Buffer.from("30450220156ccf03b65e4bba9c15985e21c07c45c1cd77f50c81637f1e9dcb3ee80b3f93022100d295f5117a7c1b9cda89ef13691d668b11d0420673dbbfba41fddc2962e80d7d", "hex");
    const authenticatorData = Buffer.from("3a6ff63ff48192d83ef73fb71f7ace2bc6b091b50214bbfe2d6bc3c69eb93be61d00000000", "hex");
    const clientData = Buffer.from("7b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a224e546f2d3161424547526e78786a6d6b61544865687972444e5833697a6c7169316f776d4f643955474a30222c226f726967696e223a2268747470733a2f2f3537653061623135373838342e6e67726f6b2e617070227d", "hex");
    const clientChallenge = Buffer.from("353a3ed5a0441919f1c639a46931de872ac3357de2ce5aa2d68c2639df54189d", "hex");

    // Get on the "challenge" key value following "
    const challengeOffset = clientData.indexOf("226368616c6c656e6765223a", 0, "hex") + 12 + 1;
    const signatureParsed = derToRS(signature);

    const signatureResult = await webauthn.checkSignature(authenticatorData, 0x01, clientData, clientChallenge, challengeOffset,
      [ethers.BigNumber.from("0x" + signatureParsed[0].toString('hex')), ethers.BigNumber.from("0x" + signatureParsed[1].toString('hex'))],
      pubkeyUintArray
    );
    expect(signatureResult);

    const validationResult = await webauthn.validate(authenticatorData, 0x01, clientData, clientChallenge, challengeOffset,
      [ethers.BigNumber.from("0x" + signatureParsed[0].toString('hex')), ethers.BigNumber.from("0x" + signatureParsed[1].toString('hex'))],
      pubkeyUintArray
    );
    await validationResult.wait();

  })
});
