package de.openkonsole;

public class CONST {

	@Deprecated
	public final static String HOST = "192.168.178.30";
	@Deprecated
	public final static int PORT = 1337;

	// Konstanten für UDP Broadcast
	public final static String BROADCAST_IDENT = "OPENKONSOLE";
	public final static String BROADCAST_SEPERATOR = ":";

	public final static int ANALOG_RANGE_MAX = 255; // one byte for each analog
													// value: 2^8 - 1

	public enum Control {
		BUTTON_START(0), BUTTON_A(1), BUTTON_B(2), BUTTON_C(3), BUTTON_D(4), ANALOG_INPUT(
				5);

		private byte identifier;

		private Control(final int byteID) {
			identifier = (byte) byteID;
		}

		public byte getIdentifier() {
			return identifier;
		}
	}

	public enum ButtonAction {
		BUTTON_DOWN(0), BUTTON_UP(1);

		private byte identifier;

		private ButtonAction(final int byteID) {
			identifier = (byte) byteID;
		}

		public byte getIdentifier() {
			return identifier;
		}
	}
}
