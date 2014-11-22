package de.openkonsole.net;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.SocketException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;
import java.nio.ByteBuffer;

import android.database.CursorJoiner.Result;
import android.text.format.Formatter;

public class UDPBroadcastSender {
	
	private static final byte[] EMPTY_MESSAGE = "INFO".getBytes();
	private static final int SOCKET_TIMEOUT = 20;
	private static final int IP_RANGE_MIN = 1;
	private static final int IP_RANGE_MAX = 254;

	private int udpPort;
	
	public UDPBroadcastSender(final int udpPort) {
		this.udpPort = udpPort;
	}
	
	public String fetchConsoleHostInfo(final int clientIpAddress) {
		final StringBuffer result = new StringBuffer();
		
		final int lastByte = clientIpAddress >> 24 & 0xff;
		
		Thread runner = new Thread(new Runnable() {
			
			@Override
			public void run() {
				DatagramSocket socket;
				try {
					socket = new DatagramSocket(udpPort);
					socket.setSoTimeout(SOCKET_TIMEOUT);
				} catch (SocketException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
					return;
				}
				
				
				for(int i=IP_RANGE_MIN; i<=IP_RANGE_MAX; i++) {
					
					if(i == lastByte) { // TODO DYN
						System.out.println("---> skipped ip " + lastByte);
						i++;
						continue;
					}
					
					InetAddress hostAddress;
					try {
						hostAddress = InetAddress.getByName("192.168.178." + i);
					} catch (UnknownHostException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
						
						i++;
						continue;
					}
					
					try {
						
						final DatagramPacket packet = new DatagramPacket(EMPTY_MESSAGE, EMPTY_MESSAGE.length, hostAddress, udpPort);
						socket.send(packet);
						
//						System.out.println("----> receiving package...");
						final byte[] bytesReceived = new byte[1024];
						final DatagramPacket packetIn = new DatagramPacket(bytesReceived, bytesReceived.length); 
						socket.receive(packetIn);
						
						String rcvd = "-------> SERVER RESPONDED" + packetIn.getAddress() + ", " + packetIn.getPort() + ": "
						          + new String(packetIn.getData(), 0, packetIn.getLength());
						System.out.println(rcvd);
						      
						result.append(new String(packetIn.getData(), 0, packetIn.getLength()));
						break;
						
					} catch (SocketException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					} catch (UnknownHostException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					} catch (IOException e) {
						// TODO igore only SocketTimeoutException
//						e.printStackTrace();
						System.out.println("---> timeout: " + hostAddress.getHostAddress());
					};
				}
				
				socket.close();
			} 
		});
		
		runner.start();
		try {
			runner.join();
		} catch (InterruptedException e) {
			e.printStackTrace();
			return null;
		}
		
		return result.toString();
	}
	
		byte[] unpack(int bytes) {
		  return new byte[] {
		    (byte)((bytes >>> 24) & 0xff),
		    (byte)((bytes >>> 16) & 0xff),
		    (byte)((bytes >>>  8) & 0xff),
		    (byte)((bytes       ) & 0xff)
		  };
		}
	
}
