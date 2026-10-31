import {Component,OnInit,inject,signal} from '@angular/core';
import {FormBuilder,ReactiveFormsModule,Validators} from '@angular/forms';
import {ActivatedRoute,Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {API_BASE_URL} from '../../../core/api-base-url.token';

@Component({standalone:true,imports:[ReactiveFormsModule],template:`
<section class="editor"><span>EDITORIAL WORKSPACE</span><h1>{{isEdit?'Edit article':'Create article'}}</h1>
<form [formGroup]="form" (ngSubmit)="save(false)">
<label>Title<input formControlName="title" (input)="generateSlug()"></label>
<label>Slug<input formControlName="slug"></label>
<label>Excerpt<textarea rows="3" formControlName="excerpt"></textarea></label>
<div class="pair"><label>Category<input formControlName="category"></label><label>Tags (comma separated)<input formControlName="tags"></label></div>
<label>Article content<textarea class="content" rows="18" formControlName="content" placeholder="Use safe HTML: headings, paragraphs, lists, links, blockquotes and images."></textarea></label>
<label>Cover image<input type="file" accept="image/jpeg,image/png,image/webp" (change)="selectCover($event)"></label>
@if(preview()){<img class="preview" [src]="preview()" alt="Cover preview">}
<div class="pair"><label>SEO title<input formControlName="seo_title"></label><label>SEO description<textarea formControlName="seo_description"></textarea></label></div>
@if(error()){<p class="error">{{error()}}</p>}
<div class="actions"><button type="button" (click)="save(false)">Save draft</button><button type="button" class="publish" (click)="save(true)">Publish</button></div>
</form></section>`,styles:[`
.editor{max-width:850px}.editor>span{color:#b88c55;font-size:10px;letter-spacing:.15em}.editor h1{font:500 42px var(--font-display);color:#1b3a33;margin:10px 0 27px}.editor form{display:grid;gap:17px}.editor label{display:grid;gap:7px;color:#55655b;font-size:12px;font-weight:600}.editor input,.editor textarea{width:100%;border:1px solid #dfe5dd;border-radius:5px;padding:11px;background:#fff;color:#263a32;font:13px var(--font-body)}.editor .content{font-family:monospace;font-size:12px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:14px}.preview{max-width:300px;max-height:180px;object-fit:cover}.actions{display:flex;gap:10px}.actions button{padding:12px 18px;border:1px solid #dfe5dd;background:#fff;color:#253e34;font-size:12px;font-weight:700}.actions .publish{background:#1b3a33;color:#fff}.error{color:#a83f37}@media(max-width:600px){.pair{grid-template-columns:1fr}}
`]})
export class BlogEditorComponent implements OnInit{
 private readonly fb=inject(FormBuilder);private readonly http=inject(HttpClient);private readonly base=inject(API_BASE_URL);private readonly route=inject(ActivatedRoute);private readonly router=inject(Router);
 readonly error=signal('');readonly preview=signal<string|null>(null);isEdit=false;postId:number|null=null;cover:File|null=null;
 readonly form=this.fb.group({title:['',[Validators.required]],slug:[''],excerpt:['',[Validators.required]],category:['General'],tags:[''],content:['',[Validators.required]],seo_title:[''],seo_description:['']});
 ngOnInit(){const id=this.route.snapshot.paramMap.get('id');if(id){this.isEdit=true;this.postId=Number(id);this.http.get<any>(this.base+'/blog/manage/posts/'+id+'/').subscribe({next:p=>{this.form.patchValue({...p,tags:(p.tags??[]).join(',')});if(p.cover_image)this.preview.set(p.cover_image);},error:()=>this.error.set('Unable to load this article.')});}}
 generateSlug(){if(!this.isEdit)this.form.controls.slug.setValue((this.form.controls.title.value??'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));}
 selectCover(e:Event){const file=(e.target as HTMLInputElement).files?.[0]??null;if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024){this.error.set('Select a JPG, PNG or WEBP cover image up to 8 MB.');return;}this.cover=file;this.preview.set(URL.createObjectURL(file));}
 save(publish:boolean){
  if(this.form.invalid){this.form.markAllAsTouched();return;}
  const v=this.form.getRawValue();const data=new FormData();
  for(const [k,val] of Object.entries(v)){if(k==='tags')data.append(k,JSON.stringify((val??'').split(',').map(x=>x.trim()).filter(Boolean)));else data.append(k,val??'');}
  data.append('status',publish?'PUBLISHED':'DRAFT');if(this.cover)data.append('cover_image',this.cover);
  const url=this.base+'/blog/manage/posts/'+(this.postId?this.postId+'/':'');const request=this.postId?this.http.patch(url,data):this.http.post(url,data);
  request.subscribe({next:()=>void this.router.navigateByUrl('/admin/blog'),error:e=>this.error.set(e.error?.detail||'Could not save the article. Check required fields and access rights.')});
 }
}
