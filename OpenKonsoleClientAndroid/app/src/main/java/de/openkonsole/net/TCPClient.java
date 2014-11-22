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

	private Ip hostAddress;
	
	private Socket clientSocket;
	private DataOutputStream outputStream;
	private InputStreamReader inputStream;
	private BufferedReader inFromServer;
	private Thread thread;

	final List<Callback> callbacks = new LinkedList<TCPClient.Callback>();

	public TCPClient(final Ip host) {
		super();
		
		hostAddress = host;
	}

	public void connect() throws UnknownHostException, IOException {
		
		clientSocket = new Socket(hostAddress.getIp(), hostAddress.getPort());
		outputStream = new DataOutputStream(clientSocket.getOutputStream());
		inputStream = new InputStreamReader(clientSocket.getInputStream());
		inFromServer = new BufferedReader(inputStream);
	
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

	public void addCallback(Callback callback) {
		callbacks.add(callback);
	}

	public interface Callback {
		void onDataReceived(String data);
	}

}
