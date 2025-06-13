import { ChannelIndexRanges } from '../datamodels/datastore.indexrange';

export class IndexBoundsResponse {
  ChannelIndexRanges: ChannelIndexRanges[];

  constructor(indexRanges: ConstructorParameters<typeof ChannelIndexRanges>[] = []) {
    this.ChannelIndexRanges = indexRanges.map((d) => new ChannelIndexRanges(...d));
  }
}
