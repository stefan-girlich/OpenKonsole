package de.openkonsole;


public class Util {

	public static byte[] buildByteArray(byte... input) {
		byte[] result = new byte[] { 0, 0, 0 };	// TODO new byte[5]

		for (int i = 0; i < result.length && i < input.length; i++) {
			result[i] = input[i];
		}

		return result;
	}

	/** Returns a byte array containing depicting the input value.
	 * The loss of precision is 2 bytes.
	 * @param val	[-0.5, 0.5]
	 * @return 	the resulting byte array, size = 2
	 */
	public static byte convertAnalogValueToByte(final float val) {
		final short shortVal = (short) Math.floor(CONST.ANALOG_RANGE_MAX * (val + 0.5f));
		System.out.println("shortval: " + shortVal);
		return (byte) shortVal;
		//return ByteBuffer.allocate(2).order(ByteOrder.LITTLE_ENDIAN).putShort(shortVal).array();
	}
}
