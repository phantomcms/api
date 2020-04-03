import { prop, Ref, getModelForClass } from '@typegoose/typegoose';
import { User } from './user';
import { Model } from '..';

// TODO make database agnostic
export class Entity {
  id: any;

  static from<T>(data: any): T {
    const entity = new Entity();

    if (data._id) {
      entity.id = data._id;
      delete data._id;
    }

    // delete the mongoose __version prop
    delete data.__v;

    // for all other properties, set them on the entity
    for (let [key, value] of Object.entries(data)) {
      entity[key] = value;
    }

    return (entity as unknown) as T;
  }
}

export class CreateableEntity extends Entity {
  @prop({ required: true })
  createdDate: Date;

  @prop({ required: true, ref: 'User' })
  createdBy: Ref<User>;

  @prop()
  lastUpdatedDate?: Date;

  @prop({ ref: 'User' })
  lastUpdatedBy?: Ref<User>;
}

export interface RepositoryOptions<T> {
  query?: RepositoryQuery<T>;
  sorting?: { property: string; direction?: 1 | -1 };
  pagination?: { limit?: number; offset?: number };
}

export type RepositoryQuery<T> = Partial<T> & { [key: string]: any };

export abstract class Repository<T> {
  protected model: Model<T>;

  constructor(entity: new () => T) {
    this.model = getModelForClass(entity);
  }

  create(document: Partial<T>): Promise<T> {
    return this.model.create(document).then((value) => {
      return Entity.from<T>(value);
    });
  }

  findOne(id: string): Promise<T> {
    return this.model
      .findById(id)
      .populate('createdBy')
      .populate('updatedBy')
      .lean<T>()
      .exec()
      .then((value) => {
        return Entity.from<T>(value);
      });
  }

  find(options?: RepositoryOptions<T>): Promise<T[]> {
    const { query, sorting, pagination } = options || {};
    const request = this.model.find(query);

    if (pagination) {
      if (pagination.offset) {
        request.limit(pagination.offset);
      }

      if (pagination.limit) {
        request.limit(pagination.limit);
      }
    }

    if (sorting) {
      request.sort({ [sorting.property]: sorting.direction || -1 });
    }

    return request
      .populate('createdBy')
      .populate('updatedBy')
      .lean<T>()
      .exec()
      .then((values) => {
        return values.map((value) => Entity.from<T>(value));
      });
  }

  async update(id: string, updates: any): Promise<T> {
    // TODO can this be made more efficient?
    await this.model.findByIdAndUpdate(id, updates).lean<T>().exec();
    return this.findOne(id).then((value) => {
      return Entity.from<T>(value);
    });
  }

  delete(id: string): Promise<T> {
    return this.model
      .findByIdAndDelete(id)
      .lean<T>()
      .exec()
      .then((value) => {
        return Entity.from<T>(value);
      });
  }
}