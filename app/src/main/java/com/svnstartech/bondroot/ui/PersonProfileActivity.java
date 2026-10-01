package com.svnstartech.bondroot.ui;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.google.android.material.button.MaterialButton;
import com.svnstartech.bondroot.R;
import com.svnstartech.bondroot.model.Person;
import com.svnstartech.bondroot.repository.PersonRepository;
import com.svnstartech.bondroot.util.LanguageManager;

import java.util.List;

public class PersonProfileActivity extends AppCompatActivity {

    private TextView tvProfileAvatar, tvProfileNameLocal, tvProfileNameEnglish, tvProfilePersonId;
    private TextView tvProfileFather, tvProfileMother, tvProfileChildren;
    private MaterialButton btnCheckRelWithMuhib;

    private PersonRepository repository;
    private Person currentPerson;

    @Override
    protected void attachBaseContext(Context newBase) {
        super.attachBaseContext(LanguageManager.applyLocale(newBase));
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_person_profile);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle(getString(R.string.title_person_profile));
            toolbar.setNavigationOnClickListener(v -> finish());
        }

        repository = PersonRepository.getInstance(this);

        tvProfileAvatar = findViewById(R.id.tvProfileAvatar);
        tvProfileNameLocal = findViewById(R.id.tvProfileNameLocal);
        tvProfileNameEnglish = findViewById(R.id.tvProfileNameEnglish);
        tvProfilePersonId = findViewById(R.id.tvProfilePersonId);
        tvProfileFather = findViewById(R.id.tvProfileFather);
        tvProfileMother = findViewById(R.id.tvProfileMother);
        tvProfileChildren = findViewById(R.id.tvProfileChildren);
        btnCheckRelWithMuhib = findViewById(R.id.btnCheckRelWithMuhib);

        btnCheckRelWithMuhib.setText(getString(R.string.check_rel_with_muhib));

        String personId = getIntent().getStringExtra("person_id");
        if (personId == null) {
            Toast.makeText(this, "Person not found", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        currentPerson = repository.getPersonById(personId);
        if (currentPerson == null) {
            Toast.makeText(this, "Person record missing", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        displayPerson();
    }

    private void displayPerson() {
        boolean isEnglish = LanguageManager.isEnglish(this);

        tvProfileNameLocal.setText(isEnglish ? currentPerson.getNameEnglish() : currentPerson.getNameLocal());
        tvProfileNameEnglish.setText(isEnglish ? currentPerson.getNameLocal() : currentPerson.getNameEnglish());
        tvProfilePersonId.setText("Person ID: " + currentPerson.getPersonId());

        String initial = "B";
        String name = isEnglish ? currentPerson.getNameEnglish() : currentPerson.getNameLocal();
        if (name == null || name.isEmpty()) name = currentPerson.getNameLocal();
        if (name != null && !name.isEmpty()) {
            initial = name.substring(0, 1).toUpperCase();
        }
        tvProfileAvatar.setText(initial);

        // Father
        String fatherLabel = isEnglish ? "Father" : "পিতা";
        if (currentPerson.getFatherId() != null) {
            Person f = repository.getPersonById(currentPerson.getFatherId());
            tvProfileFather.setText(fatherLabel + ": " + (f != null ? f.getDisplayName(isEnglish) : currentPerson.getFatherId()));
        } else {
            tvProfileFather.setText(fatherLabel + ": " + (isEnglish ? "Unknown / Root Ancestor" : "জানা নেই / মূল পূর্বপুরুষ (Root)"));
        }

        // Mother
        String motherLabel = isEnglish ? "Mother" : "মাতা";
        if (currentPerson.getMotherId() != null) {
            Person m = repository.getPersonById(currentPerson.getMotherId());
            tvProfileMother.setText(motherLabel + ": " + (m != null ? m.getDisplayName(isEnglish) : currentPerson.getMotherId()));
        } else {
            tvProfileMother.setText(motherLabel + ": " + (isEnglish ? "Unknown" : "জানা নেই"));
        }

        // Children
        List<Person> all = repository.getAllPersons();
        StringBuilder childrenBuilder = new StringBuilder();
        int count = 0;
        for (Person p : all) {
            if (currentPerson.getPersonId().equals(p.getFatherId()) || currentPerson.getPersonId().equals(p.getMotherId())) {
                if (count > 0) childrenBuilder.append(", ");
                childrenBuilder.append(p.getDisplayName(isEnglish));
                count++;
            }
        }
        if (count == 0) {
            tvProfileChildren.setText(getString(R.string.no_children));
        } else {
            tvProfileChildren.setText(getString(R.string.children_prefix, count, childrenBuilder.toString()));
        }

        // Button action
        btnCheckRelWithMuhib.setOnClickListener(v -> {
            Intent intent = new Intent(PersonProfileActivity.this, FindRelationshipActivity.class);
            intent.putExtra("personA_id", "P100005"); // Muhib
            intent.putExtra("personB_id", currentPerson.getPersonId());
            startActivity(intent);
        });
    }
}
