package de.openkonsole;

public class Util {

	public static byte[] buildByteArray(byte... input) {
		byte[] result = new byte[] { 0, 0, 0, 0, 0 };

		for (int i = 0; i < result.length && i < input.length; i++) {
			result[i] = input[i];
		}

		return result;
	}

}
