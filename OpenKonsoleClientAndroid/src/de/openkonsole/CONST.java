package de.openkonsole;

public class CONST {

	public final static String HOST = "192.168.178.30";
	public final static int PORT = 1337;
	
	/** The maximum value for analog input information (inclusive);
	 * 	one byte for each analog value: 2^8 - 1 - 1 (because we want 
	 * to have an uneven count (including 0) in order to store 
	 * center positions with equal partial ranges to the left/right. */
	public final static int ANALOG_RANGE_MAX = 254;

	public enum Control {
		BUTTON_START(0),
		BUTTON_A(1),
		BUTTON_B(2),
		BUTTON_C(3),
		BUTTON_D(4),
		ANALOG_INPUT(5);
		
		private byte identifier;
		
		private Control(final int byteID) {
			identifier = (byte) byteID;
		}
		
		public byte getIdentifier() {
			return identifier;
		}
	}
	
	public enum ButtonAction {
		BUTTON_DOWN(0),
		BUTTON_UP(1);
		
		private byte identifier;
		
		private ButtonAction(final int byteID) {
			identifier = (byte) byteID;
		}
		
		public byte getIdentifier() {
			return identifier;
		}
	}
}
