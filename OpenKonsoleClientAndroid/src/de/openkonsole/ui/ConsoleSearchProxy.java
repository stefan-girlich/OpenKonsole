package de.openkonsole.ui;

import org.json.JSONException;
import org.json.JSONObject;

import de.openkonsole.net.UDPBroadcastSender;

public class ConsoleSearchProxy {
	
	private UDPBroadcastSender broadcastSender;
	
	private int udpPort;
	
	public ConsoleSearchProxy(final int udpPort) {
		this.udpPort = udpPort;
		this.broadcastSender = new UDPBroadcastSender(udpPort);
	}
	
	public ConsoleInfo findConsole(final int clientIpAddress) {
		final String serverResponse = broadcastSender.fetchConsoleHostInfo(clientIpAddress);
		System.out.println("---> SERVER RESP " + serverResponse);
		return ConsoleInfo.fromJSON(serverResponse);
	}
	
	
	
	public static class ConsoleInfo {
		
		public static ConsoleInfo fromJSON(final String jsonString) {
			
			JSONObject jsonObj;
			try {
				 jsonObj = new JSONObject(jsonString);
				 final String host = jsonObj.getString("host");	
				 final int udpPort = Integer.parseInt(jsonObj.getString("udpPort"));
				 return new ConsoleInfo(host, udpPort, -1); // TODO 
			} catch (JSONException e) {
				// TODO improve error handling
				e.printStackTrace();
				return null;
			}
		}
		
		public String host;
		public int udpPort;
		public int tcpPort;
		
		public ConsoleInfo(final String host, final int udpPort, final int tcpPort) {
			this.host = host;
			this.udpPort = udpPort;
			this.tcpPort = tcpPort;
		}
	}

}
