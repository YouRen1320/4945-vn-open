const ascii = (buffer, start, end) => buffer.toString('ascii', start, end)

const readUint24LE = (buffer, offset) => (
  buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16)
)

// Reads only the standardized WebP container headers needed by the asset gate; it never decodes pixels.
export const readWebpDimensions = (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
    throw new Error('文件过短，缺少 RIFF WEBP 头')
  }
  if (ascii(buffer, 0, 4) !== 'RIFF' || ascii(buffer, 8, 12) !== 'WEBP') {
    throw new Error('文件头不是 RIFF WEBP')
  }

  const declaredLength = buffer.readUInt32LE(4) + 8
  if (declaredLength > buffer.length) {
    throw new Error(`RIFF 声明长度 ${declaredLength} 超出文件长度 ${buffer.length}`)
  }

  let offset = 12
  while (offset + 8 <= declaredLength) {
    const chunkType = ascii(buffer, offset, offset + 4)
    const chunkLength = buffer.readUInt32LE(offset + 4)
    const dataOffset = offset + 8
    const dataEnd = dataOffset + chunkLength
    if (dataEnd > declaredLength) {
      throw new Error(`${chunkType.trim() || '未知'} 数据块越界`)
    }

    if (chunkType === 'VP8X') {
      if (chunkLength < 10) throw new Error('VP8X 数据块过短')
      return {
        width: readUint24LE(buffer, dataOffset + 4) + 1,
        height: readUint24LE(buffer, dataOffset + 7) + 1,
      }
    }

    if (chunkType === 'VP8 ') {
      if (chunkLength < 10) throw new Error('VP8 数据块过短')
      if (
        buffer[dataOffset + 3] !== 0x9d
        || buffer[dataOffset + 4] !== 0x01
        || buffer[dataOffset + 5] !== 0x2a
      ) {
        throw new Error('VP8 帧同步码无效')
      }
      return {
        width: buffer.readUInt16LE(dataOffset + 6) & 0x3fff,
        height: buffer.readUInt16LE(dataOffset + 8) & 0x3fff,
      }
    }

    if (chunkType === 'VP8L') {
      if (chunkLength < 5) throw new Error('VP8L 数据块过短')
      if (buffer[dataOffset] !== 0x2f) throw new Error('VP8L 签名字节无效')
      return {
        width: 1 + buffer[dataOffset + 1] + ((buffer[dataOffset + 2] & 0x3f) << 8),
        height: 1
          + ((buffer[dataOffset + 2] & 0xc0) >> 6)
          + (buffer[dataOffset + 3] << 2)
          + ((buffer[dataOffset + 4] & 0x0f) << 10),
      }
    }

    offset = dataEnd + (chunkLength % 2)
  }

  throw new Error('未找到 VP8、VP8L 或 VP8X 尺寸数据块')
}
