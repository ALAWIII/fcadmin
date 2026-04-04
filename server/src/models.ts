import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ length: 50 })
  username: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ name: "password_hash", length: 255, select: false })
  passwordHash: string; // camelCase, maps to snake_case column

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @Column({ name: "storage_quota_bytes", type: "bigint", default: 2147483648 })
  storageQuotaBytes: number = 2147483648;

  @Column({ name: "storage_used_bytes", type: "bigint", default: 0 })
  storageUsedBytes: number = 0;

  @Column({ name: "root_folder", type: "uuid", nullable: true })
  rootFolder?: string;
  constructor(
    id: string,
    username: string,
    email: string,
    pswd: string,
    createdAt: Date,
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.passwordHash = pswd;
    this.createdAt = createdAt;
  }
  set setQuotaBytes(s: number) {
    this.storageQuotaBytes = s;
  }
}

export enum ObjectStatus {
  ACTIVE = "active",
  DELETED = "deleted",
}

export enum Visibility {
  PRIVATE = "private",
  PUBLIC = "public",
}

@Entity("folders")
export class Folder {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ name: "owner_id", type: "uuid" })
  ownerId: string;

  @Column({ name: "parent_id", type: "uuid", nullable: true })
  parentId?: string;

  @Column({ length: 255 })
  name: string;

  @Column({
    type: "enum",
    enum: ObjectStatus,
    enumName: "object_status", // matches existing DB enum name
    default: ObjectStatus.ACTIVE,
    nullable: true,
  })
  status?: ObjectStatus;

  @Column({
    type: "enum",
    enum: Visibility,
    enumName: "visibility", // matches existing DB enum name
    default: Visibility.PRIVATE,
    nullable: true,
  })
  visibility?: Visibility;

  @CreateDateColumn({ name: "created_at", type: "timestamptz", nullable: true })
  createdAt?: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamptz", nullable: true })
  deletedAt?: Date;

  @Column({ name: "copying_children_count", type: "int", default: 0 })
  copyingChildrenCount: number;

  constructor(
    id: string,
    ownerId: string,
    name: string,
    status: ObjectStatus = ObjectStatus.ACTIVE,
    visibility: Visibility = Visibility.PRIVATE,
  ) {
    this.id = id;
    this.ownerId = ownerId;
    this.name = name;
    this.status = status;
    this.visibility = visibility;
    this.copyingChildrenCount = 0;
  }
}

@Entity("files")
export class File {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ name: "owner_id", type: "uuid" })
  ownerId: string;

  @Column({ name: "parent_id", type: "uuid" })
  parentId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: "bigint" })
  size: number;

  @Column({ type: "text" })
  etag: string;

  @Column({ name: "mime_type", type: "text" })
  mimeType: string;

  @Column({ name: "last_modified", type: "timestamptz", nullable: true })
  lastModified?: Date;

  @CreateDateColumn({ name: "created_at", type: "timestamptz", nullable: true })
  createdAt?: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamptz", nullable: true })
  deletedAt?: Date;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>;

  @Column({
    type: "enum",
    enum: ObjectStatus,
    enumName: "object_status",
    default: ObjectStatus.ACTIVE,
    nullable: true,
  })
  status?: ObjectStatus;

  @Column({
    type: "enum",
    enum: Visibility,
    enumName: "visibility",
    default: Visibility.PRIVATE,
    nullable: true,
  })
  visibility?: Visibility;

  @Column({ type: "text", nullable: true })
  checksum?: string;

  constructor(
    id: string,
    ownerId: string,
    parentId: string,
    name: string,
    size: number,
    etag: string,
    mimeType: string,
    status: ObjectStatus = ObjectStatus.ACTIVE,
    visibility: Visibility = Visibility.PRIVATE,
  ) {
    this.id = id;
    this.ownerId = ownerId;
    this.parentId = parentId;
    this.name = name;
    this.size = size;
    this.etag = etag;
    this.mimeType = mimeType;
    this.status = status;
    this.visibility = visibility;
  }
}
@Entity("admins", { schema: "admin" })
export class Admin {
  @PrimaryColumn({ length: 50 })
  username!: string;

  @Column({ name: "password_hash", length: 255, select: false })
  passwordHash!: string;
}
