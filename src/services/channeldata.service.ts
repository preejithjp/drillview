import { store } from '@/main';
import Logger from '@/common/logger';
import { BinaryResponse, BinaryUtils } from '@/common/binary-utils';
import {
  RangeRequest,
  IndexRangeRequest,
  LastNRowsData,
  StartPlaybackRequest,
  StreamingRequest,
  GroupStreamingRequest,
} from '@/interfaces/streaming.interfaces';
import { WebSocketTransport } from '../transports/websocket.transport';
import { DataStoreResponse } from '@/helpers/datastore/datastore.response';
import { AllRequestBodyTypes, DataStoreRequest } from '@/helpers/datastore/datastore.request';
import { Commands, RequestHeader } from '@/helpers/datastore/requestmodels/datastore.requestheader';
import { DataStoreStreamRequest } from '@/helpers/datastore/requestmodels/datastore.streamrequest';
import { DataStoreNRowRequest } from '@/helpers/datastore/requestmodels/datastore.nrowrequest';
import { DataStoreStopStreamingRequest } from '@/helpers/datastore/requestmodels/datastore.stopstreamrequest';
import { DataStoreMetadataRequest } from '@/helpers/datastore/requestmodels/datastore.metadatarequest';
import { DataStoreIndexRequest } from '@/helpers/datastore/requestmodels/datastore.indexboundrequest';
import { DataStoreRangeRequest } from '@/helpers/datastore/requestmodels/datastore.rangerequest';
import { DataStoreStartPlaybackRequest } from '@/helpers/datastore/requestmodels/datastore.startplaybackrequest';
import { DataStoreStopPlaybackRequest } from '@/helpers/datastore/requestmodels/datastore.stopplaybackrequest';
import { ResponseTypes } from '@/helpers/datastore/responsemodels/datastore.responseheader';
import { MetadataResponse } from '@/helpers/datastore/responsemodels/datastore.metadata';
import { WarningResponse } from '@/helpers/datastore/responsemodels/datastore.warning';
import { AcknowledgmentResponse } from '@/helpers/datastore/responsemodels/datastore.acknowledgement';
import { ErrorResponse } from '@/helpers/datastore/responsemodels/datastore.error';
import { ChannelDataResponse } from '@/helpers/datastore/responsemodels/datastore.channeldata';
import { IndexBoundsResponse } from '@/helpers/datastore/responsemodels/datastore.indexbounds';
import { PlaybackCompltedResponse } from '@/helpers/datastore/responsemodels/datastore.playback';
import { DataStoreGroupStreamRequest } from '@/helpers/datastore/requestmodels/datastore.group.streamrequest';
import { ChannelGroupDataResponse } from '@/helpers/datastore/responsemodels/datastore.channelgroupdata';
import { DataStoreChannelInfo } from '@/helpers/datastore/datamodels/datastore.channelinfo';
import { DataStoreChannelState } from '@/helpers/datastore/datamodels/datastore.channelstate';
import { ChannelStateResponse } from '@/helpers/datastore/responsemodels/datastore.channelstate';
import { DataStoreStateRequest } from '@/helpers/datastore/requestmodels/datastore.staterequest';

type ResponseCallback = (msg: any) => void;

export class ChannelDataService {
  private static webSocketClient: WebSocketTransport;
  private static webSocketStreamClient: WebSocketTransport;
  private static requestMap: Map<number, Array<ResponseCallback>> = new Map();
  private static pendingChannels: Set<number> = new Set();
  private static debounceTimer: NodeJS.Timeout | null = null;

  private static initialize() {
    this.webSocketClient = new WebSocketTransport(store.runtimeConfig.DATA_STORE_URL);
    this.webSocketClient.on('message', (data) => this.receiveMessage(data));
  }
  private static initializeStream() {
    this.webSocketStreamClient = new WebSocketTransport(store.runtimeConfig.DATA_STORE_URL);
    this.webSocketStreamClient.on('message', (data) => this.receiveMessage(data));
  }

  private static isStreamCommand(command: Commands): boolean {
    return [Commands.Stream, command, Commands.StreamGroup, Commands.StopStream, Commands.StopStreamGroup].includes(command);
  }

  private static sendRequest(command: Commands, body: AllRequestBodyTypes, callback?: ResponseCallback) {
    const reqId = this.generateRequestId();
    const header = new RequestHeader(reqId, command);
    const request = new DataStoreRequest(header, body);
    const channels: number[] = body.ChannelIds || [];
    const isStream = this.isStreamCommand(command);

    if (isStream && channels) {
      channels.forEach((id) => {
        const arr = this.requestMap.get(id) || [];
        if (callback && !arr.includes(callback)) arr.push(callback);
        this.requestMap.set(id, arr);
      });
    } else if (callback) {
      this.requestMap.set(reqId, [callback]);
    }

    if (!this.webSocketClient && !isStream) this.initialize();
    if (!this.webSocketStreamClient && isStream) this.initializeStream();
    const binaryReq = this.FormatRequestToBinary(request);
    if (isStream) {
      this.webSocketStreamClient.sendMessage(binaryReq);
    } else {
      this.webSocketClient.sendMessage(binaryReq);
    }
  }

  static startStreaming(config: StreamingRequest) {
    config.ChannelIds.forEach((channelId) => {
      const id = Number(channelId);
      const callbacks = this.requestMap.get(id);
      if (callbacks && callbacks.length > 0) {
        callbacks.push(config.callback);
      } else {
        this.requestMap.set(id, [config.callback]);
        this.pendingChannels.add(id);
      }
    });

    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      const channelsToStream = Array.from(this.pendingChannels);
      if (channelsToStream.length > 0) {
        this.sendRequest(Commands.Stream, new DataStoreStreamRequest(undefined, channelsToStream), undefined);
        this.pendingChannels.clear();
      }
      this.debounceTimer = null;
    }, 1000);
  }

  static startGroupStreaming(config: GroupStreamingRequest) {
    // TODO - Implement Req Cacheing for multiple grouopid callbacks
    // TODO - Implement StopGroupStreaming
    const groupId = config.GroupId;
    this.sendRequest(Commands.StreamGroup, new DataStoreGroupStreamRequest(undefined, groupId), config.callback);
  }

  static getLastNRowsData(config: LastNRowsData) {
    this.sendRequest(
      Commands.GetLastNRows,
      new DataStoreNRowRequest(config.TransferIntervalMilliSeconds, config.ChannelIds, config.NRows, config.InterpolationMode, config.Interpolations),
      config.callback
    );
  }

  static getRangeData(config: RangeRequest) {
    this.sendRequest(
      Commands.GetRange,
      new DataStoreRangeRequest(
        config.ChannelIds,
        config.StartIndex,
        config.EndIndex,
        config.TransferIntervalMilliSeconds,
        config.InterpolationMode,
        config.Interpolations
      ),
      config.callback
    );
  }

  static getChannelIndexes(config: IndexRangeRequest) {
    this.sendRequest(Commands.GetIndexBounds, new DataStoreIndexRequest(config.ChannelIds), config.callback);
  }

  static getMetaData(channelIds: number[], callback: (msg: DataStoreChannelInfo[]) => void) {
    if (!channelIds?.length) return;
    this.sendRequest(Commands.GetMetadata, new DataStoreMetadataRequest(channelIds), callback);
  }

  static getState(channelIds: number[], callback: (msg: DataStoreChannelState[]) => void) {
    if (!channelIds?.length) return;
    this.sendRequest(Commands.GetChannelState, new DataStoreStateRequest(channelIds), callback);
  }

  static stopStreaming(channelIds: number[], callback?: ResponseCallback) {
    const channelsToActuallyStop: number[] = [];

    for (const channelId of channelIds) {
      if (callback) {
        const callbacks = this.requestMap.get(channelId);
        if (!callbacks) continue;
        const idx = callbacks.indexOf(callback);
        if (idx !== -1) callbacks.splice(idx, 1);
        if (callbacks.length === 0) {
          this.requestMap.delete(channelId);
          channelsToActuallyStop.push(channelId);
        }
      } else {
        this.requestMap.delete(channelId);
        channelsToActuallyStop.push(channelId);
      }
    }

    if (channelsToActuallyStop.length > 0) {
      this.sendRequest(Commands.StopStream, new DataStoreStopStreamingRequest(channelsToActuallyStop));
    }
  }

  static startPlayback(config: StartPlaybackRequest) {
    this.sendRequest(
      Commands.StartPlayback,
      new DataStoreStartPlaybackRequest(
        config.RequestType,
        config.Speed,
        config.ChannelIds,
        config.LastNRows,
        config.StartIndex,
        config.EndIndex,
        config.InterpolationMode,
        config.Interpolations
      ),
      config.callback
    );
  }

  static stopPlayback(channelIds: number[]) {
    this.sendRequest(Commands.StopPlayback, new DataStoreStopPlaybackRequest(channelIds));
  }

  private static receiveMessage(msg: BinaryResponse) {
    try {
      const deserialized: ConstructorParameters<typeof DataStoreResponse> = BinaryUtils.Deserialize(msg);
      const dataParsed = new DataStoreResponse(...deserialized);
      this.sendResponseToCb(dataParsed);
    } catch (error) {
      Logger.Error('WebSocket receiveMessage error', error.message || error);
    }
  }

  private static sendResponseToCb(response: DataStoreResponse) {
    const reqId = response.Header.ResponseForRequestId;
    switch (response.Header.ResponseType) {
      case ResponseTypes.Acknowledgment: {
        const AckBody = response.Body as AcknowledgmentResponse;
        this.requestMap.get(reqId)?.forEach((cb) => cb(AckBody.Message));
        break;
      }
      case ResponseTypes.Warning: {
        const WBody = response.Body as WarningResponse;
        this.requestMap.get(reqId)?.forEach((cb) => cb(WBody.Message));
        break;
      }
      case ResponseTypes.Exception: {
        const EBody = response.Body as ErrorResponse;
        this.requestMap.get(reqId)?.forEach((cb) => cb(EBody.Message));
        break;
      }
      case ResponseTypes.Data: {
        const DBody = response.Body as ChannelDataResponse;
        DBody.data.forEach((d) => {
          this.requestMap.get(d.ChannelId)?.forEach((cb) => cb([d]));
        });
        if (this.requestMap.has(reqId)) {
          this.requestMap.get(reqId)?.forEach((cb) => cb(DBody.data));
          if (!DBody.hasMoreData) {
            this.requestMap.delete(reqId);
          }
        }
        break;
      }
      case ResponseTypes.GroupedData: {
        const DBody = response.Body as ChannelGroupDataResponse;
        DBody.data.forEach((d) => {
          this.requestMap.get(d.GroupId)?.forEach((cb) => cb([d]));
        });
        break;
      }
      case ResponseTypes.Metadata: {
        const MetaBody = response.Body as MetadataResponse;
        this.requestMap.get(reqId)?.forEach((cb) => cb(MetaBody.DataStoreChannelInfo));
        this.requestMap.delete(reqId);
        break;
      }
      case ResponseTypes.ChannelState: {
        const StateBody = response.Body as ChannelStateResponse;
        this.requestMap.get(reqId)?.forEach((cb) => cb(StateBody.DataStoreChannelState));
        this.requestMap.delete(reqId);
        break;
      }
      case ResponseTypes.IndexBounds: {
        const IBBody = response.Body as IndexBoundsResponse;
        this.requestMap.get(reqId)?.forEach((cb) => cb(IBBody.ChannelIndexRanges));
        this.requestMap.delete(reqId);
        break;
      }
      case ResponseTypes.PlaybackComplted: {
        const PBody = response.Body as PlaybackCompltedResponse;
        this.requestMap.get(reqId)?.forEach((cb) => cb(PBody.ChannelIds));
        break;
      }
    }
  }

  private static generateRequestId() {
    return Math.round(performance.now() * Math.pow(10, 11)) + crypto.getRandomValues(new Uint32Array(1))[0];
  }

  private static FormatRequestToBinary(request: DataStoreRequest) {
    const formatted = Object.values({
      Header: Object.values(request.Header),
      Body: BinaryUtils.Serialize(Object.values(request.Body)),
    });
    return BinaryUtils.Serialize(formatted);
  }
}
