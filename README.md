# Passkeys + Webauthn

The following is a sample Solidity EVM-compatible smart contract that verifies a Passkey public key and signature over random data. The values obtained in the tests were generated in [Passkeys.is](https://passkeys.is). When creating a key in the top left corner, look for the console for the following debug info:

```javascript
# Roughly 182 characters, important to verify the key was Passkey ("platform")
(🪪,ℹ️) Public Key as Hex - 3059301306072a8648ce3d...01ac63229
```

At the same time, when loading (signing) the key in your device, look for the following information in the console.

```javascript
# Roughly 142 characters, might vary
[Debug] (🖊️,ℹ️), signature (2)
"30450220156ccf03b65e4b....962e80d7d"
# Roughly 246 characters, might vary based on the website used for debugging
[Debug] (👤,ℹ️), clientDataJSON (2)
"7b2274797065223a22776562617574686....67726f6b2e617070227d"
# Roughly 74 characters, identifyes your Passkey
[Debug] (🔑,ℹ️), authenticatorData – "3a6ff63ff48192d83ef73......e2d6bc3c69eb93be61d00000000"
[Debug] (👤,ℹ️), challenge (from clientDataJSON) – "353a3ed5a0441919f1c639a46931de872ac3357de2ce5aa2d68c2639df54189d"
```

The value `353a3ed5a0441919f1c639a46931de872ac3357de2ce5aa2d68c2639df54189d` was hardcoded for test purposes. You might had seen this value in other repos, which comes from a script `credgen.py` (also in this repository). Running that script will generate also these values but will **FAIL** with these tests because we are expecting a Passkey public key.

### Requirements

```bash
node v18.0
```

### Installation

```bash
npm install
```

### Tests

Remove `REPORT_GAS` if you do not want the gas report. Expect the validation to cost roughly `1.2m` gas. Other projects (see `References`) are working in optimizing these operations.

```bash
REPORT_GAS=true npx hardhat test
```

### References

- [https://github.com/btchip/Webauthn.sol](https://github.com/btchip/Webauthn.sol)
- [https://github.com/rdubois-crypto/FreshCryptoLib](https://github.com/rdubois-crypto/FreshCryptoLib)
- [https://github.com/porco-rosso-j/zksync-account-webauthn](https://github.com/porco-rosso-j/zksync-account-webauthn)
- [https://github.com/alembic-tech/P256-verify-signature](https://github.com/alembic-tech/P256-verify-signature)
