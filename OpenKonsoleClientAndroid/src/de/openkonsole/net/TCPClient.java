package de.openkonsole.net;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.Socket;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.util.LinkedList;
import java.util.List;

import de.openkonsole.CONST;

public class TCPClient {

	final Socket clientSocket;
	final DataOutputStream outputStream;
	final InputStreamReader inputStream;
	final BufferedReader inFromServer;
	private Thread thread;

	final List<Callback> callbacks = new LinkedList<TCPClient.Callback>();

	public TCPClient() throws UnknownHostException, IOException {
		super();
		Ip host = getHostIp();
		clientSocket = new Socket(host.getIp(), host.getPort());
		outputStream = new DataOutputStream(clientSocket.getOutputStream());
		inputStream = new InputStreamReader(clientSocket.getInputStream());
		inFromServer = new BufferedReader(inputStream);
		listenToSocket();
	}

	private Ip getHostIp() {
		System.out.println("Tryping to resolve Host IP...");
		final StringBuffer buffer = new StringBuffer();
		Thread runner = new Thread(new Runnable() {

			@Override
			public void run() {
				try {
					System.out.println("Creating Socket");
					final DatagramSocket socket = new DatagramSocket(30300);
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

	public void close() {
		if (clientSocket != null) {
			try {
				clientSocket.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

		if (thread != null) {
			thread.interrupt();
		}
	}

	public boolean isConnected() {
		if (clientSocket != null) {
			return clientSocket.isConnected();
		}
		return false;
	}

	public void sendRequest(byte[] buffer) {
		System.out.println("Trying to send data: " + buffer);
		if (outputStream != null && clientSocket.isConnected()) {
			try {
				outputStream.write(buffer);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}

	public void listenToSocket() {

		thread = new Thread(new Runnable() {

			@Override
			public void run() {

				while (true) {

					try {
						String message = inFromServer.readLine();
						if (message != null) {
							for (Callback callback : callbacks) {
								callback.onDataReceived(message);
							}
						}
					} catch (Exception e) {
						e.printStackTrace();
						break;
					}
				}
			}
		});

		thread.start();
	}

	public void addCallback(Callback callback) {
		callbacks.add(callback);
	}

	public interface Callback {
		void onDataReceived(String data);
	}

	private class Ip {
		private final String ip;
		private final int port;

		public Ip(String ip, int port) {
			super();
			this.ip = ip;
			this.port = port;
		}

		public String getIp() {
			return ip;
		}

		public int getPort() {
			return port;
		}

	}

}
