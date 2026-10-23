const crypto = require('crypto');

function hashPayload(payload) {
  const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHash('sha256').update(str).digest('hex');
}

function createAuditBlock(index, previousHash, actor, action, patientId, details) {
  const timestamp = new Date().toISOString();
  const payload = {
    index,
    timestamp,
    actor,
    action,
    patientId: patientId || null,
    details
  };
  const payloadHash = hashPayload(payload);
  const blockHash = hashPayload(`${index}-${previousHash}-${payloadHash}-${timestamp}`);

  return {
    blockNumber: index,
    timestamp,
    actor,
    action,
    patientId: patientId || null,
    details,
    payloadHash: `0x${payloadHash.slice(0, 16)}...${payloadHash.slice(-8)}`,
    fullPayloadHash: payloadHash,
    previousHash,
    blockHash: `0x${blockHash.slice(0, 24)}...${blockHash.slice(-8)}`,
    fullBlockHash: blockHash,
    verified: true
  };
}

function computeMerkleRoot(blocks) {
  if (!blocks || blocks.length === 0) return '0x00000000000000000000000000000000';
  let hashes = blocks.map(b => b.fullBlockHash || hashPayload(JSON.stringify(b)));
  
  while (hashes.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < hashes.length; i += 2) {
      if (i + 1 < hashes.length) {
        nextLevel.push(hashPayload(hashes[i] + hashes[i + 1]));
      } else {
        nextLevel.push(hashes[i]);
      }
    }
    hashes = nextLevel;
  }
  return `0x${hashes[0].slice(0, 8)}...${hashes[0].slice(-6)}`;
}

module.exports = {
  hashPayload,
  createAuditBlock,
  computeMerkleRoot
};
