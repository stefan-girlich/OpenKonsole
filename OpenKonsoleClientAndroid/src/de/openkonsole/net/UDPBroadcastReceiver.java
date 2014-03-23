package de.openkonsole.net;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.SocketException;

import de.openkonsole.CONST;

public class UDPBroadcastReceiver {
	
	private int udpPort;
	
	public UDPBroadcastReceiver(final int udpPort) {
		this.udpPort = udpPort;
	}

	// TODO stopListening()
	
	public Ip listenForHost() {
		System.out.println("Tryping to resolve Host IP...");
		final StringBuffer buffer = new StringBuffer();
		Thread runner = new Thread(new Runnable() {

			@Override
			public void run() {
				try {
					System.out.println("Creating Socket");
					final DatagramSocket socket = new DatagramSocket(udpPort);
					byte[] receiveData = new byte[33];
					final DatagramPacket receivePacket = new DatagramPacket(
							receiveData, receiveData.length);
					while (true) {
						System.out.println("trying to receive");
						socket.receive(receivePacket);
						String data = new String(receivePacket.getData(), 0,
								receivePacket.getLength());
						System.out.println("Received Data: " + data);
						if (data.startsWith(CONST.BROADCAST_IDENT)) {
							buffer.append(data.split(CONST.BROADCAST_SEPERATOR)[1]
									+ CONST.BROADCAST_SEPERATOR
									+ data.split(CONST.BROADCAST_SEPERATOR)[2]);
							break;
						}
					}
					socket.close();
				} catch (SocketException e) {
					e.printStackTrace();
				} catch (IOException e) {
					e.printStackTrace();
				}

			}
		});
		runner.start();
		try {
			runner.join();
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		return new Ip(buffer.toString().split(CONST.BROADCAST_SEPERATOR)[0],
				Integer.parseInt(buffer.toString().split(
						CONST.BROADCAST_SEPERATOR)[1]));
	}
}
